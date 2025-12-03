import billing from "../schema/billing.js";
import employee from "../schema/employee.js";
import order from "../schema/order.js";
import { notifyOrderDetails } from "../utils/utils.js";

export const getAllOrders = async (req, res) => {
  const query = req.query;
  let queryBuilder = {};
  if (query.name) queryBuilder = { ...queryBuilder, name: query.name };
  if (query.phone) queryBuilder = { ...queryBuilder, phone: query.phone };
  if (query.mail) queryBuilder = { ...queryBuilder, email: query.email };
  if (query.gt && query.lt) {
    queryBuilder = {
      ...queryBuilder,
      $and: [
        { amount: { $lte: Number(query.lt) } },
        { amount: { $gte: Number(query.gt) } },
      ],
    };
  } else {
    if (query.gt) {
      queryBuilder = { ...queryBuilder, amount: { $gte: Number(query.gt) } };
    }
    if (query.lt) {
      queryBuilder = { ...queryBuilder, amount: { $lte: Number(query.lt) } };
    }
  }
  if (query.orderStatus) {
    queryBuilder = { ...queryBuilder, status: query.orderStatus };
  }
  if (query.addressedBy == "null") {
    queryBuilder = { ...queryBuilder, addressedBy: { $exists: false } };
  } else if (query.addressedBy) {
    queryBuilder = { ...queryBuilder, addressedBy: query.addressedBy };
  }
  if (query.id) queryBuilder = { _id: query.id };
  try {
    const totalCount = await order.countDocuments(queryBuilder);
    const allItems = await order
      .find(queryBuilder)
      .populate("serviceCategory", "name")
      .populate("addressedBy", "fname lname")
      .populate("amount", "total")
      .skip((query.page - 1) * query.items)
      .limit(query.items)
      .sort({ bookTime: -1 });
    return res.status(200).json({
      message: "Successful",
      data: allItems,
      pagination: {
        count: totalCount,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getUsersOrderList = async (req, res) => {
  const { listIds } = req.body;
  try {
    const allItems = await order
      .find({ _id: { $in: listIds } })
      .populate("serviceCategory", "name")
      .populate("addressedBy", "fname lname")
      .populate("amount", "description tax total discount subTotal");
    return res.status(200).json({ data: allItems });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getOrderById = async (req, res) => {
  const _id = req.params.id;
  try {
    const individulaOrder = await order
      .findOne({ _id })
      .populate("serviceCategory", "name")
      .populate("addressedBy", "fname lname")
      .populate("amount", "description tax total discount subTotal");
    // console.log(individulaOrder, "ID");
    return res
      .status(200)
      .json({ message: "Successful", item: individulaOrder });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateOrderDetails = async (req, res) => {
  const orderId = req.params.id;
  const { category, selectedCategory, service, empId, ...body } = req.body;

  try {
    if (selectedCategory !== category) {
      const orderUpdated = await order.updateOne(
        { _id: orderId },
        {
          $set: { ...body, status: "Pending", serviceCategory: category, parentService: service },
          $unset: { addressedBy: "" },
        }
      );

      if (orderUpdated.modifiedCount > 0) {
        try {
          await employee.findByIdAndUpdate(empId, {
            $unset: { currentOrder: "" },
          });
          return res.status(200).json({
            message: "Order category changed and updated successfully",
          });
        } catch (err) {
          await order.updateOne(
            { _id: orderId },
            {
              $set: { addressedBy: empId },
            }
          );
          return res
            .status(500)
            .json({ message: "Rollback: employee update failed" });
        }
      } else {
        return res
          .status(500)
          .json({ message: "Order not updated (category change)" });
      }
    } else {
      // Case 2: Category did not change → update everything else
      await order.findByIdAndUpdate({ _id: orderId }, { $set: { ...body } });
      return res
        .status(200)
        .json({ message: "Order details updated (no category change)" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const unAssignOrder = async (req, res) => {
  const id = req.params.id;
  const { empId } = req.query;
  try {
    const itemUpdated = await order.updateOne(
      { _id: id },
      { $set: { status: "Pending" }, $unset: { addressedBy: "" } }
    );
    console.log("Data modified", itemUpdated.modifiedCount);
    if (itemUpdated.modifiedCount) {
      try {
        await employee.findByIdAndUpdate(empId, {
          $unset: { currentOrder: "" },
        });
        return res.status(200).json({ message: "Operation successful" });
      } catch (err) {
        await order.updateOne(
          { _id: id },
          { $set: { status: "Progress", addressedBy: empId } }
        );
        return res.status(500).json({ message: "Sorry! try again" });
      }
    } else {
      return res.status(500).json({ message: "Order not updated" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const changeOrderStatus = async (req, res) => {
  const { status, amount, employeeId, orderId } = req.body;

  if (status === "complete") {
    try {
      const orderToUpdate = await order.findById(orderId);
      if (!orderToUpdate) {
        return res.status(400).json({ message: "Order does not exist" });
      }

      console.log("Updating order to complete", req.body.amount);
      const subtotal = amount.description.reduce((acc, curr) => {
        const quantity = curr.quantity || 1;
        return acc + curr.price * quantity;
      }, 0);

      const taxAmount = (subtotal * (amount.tax || 0)) / 100;
      const discount = amount.discount || 0;
      const total = subtotal + taxAmount - discount;

      const newBill = new billing({
        orderId: orderToUpdate._id,
        description: amount.description,
        tax: amount.tax,
        discount: amount.discount,
        subTotal: subtotal,
        total,
      });

      const savedBill = await newBill.save();

      const updatedOrder = await order.findByIdAndUpdate(
        orderId,
        { $set: { amount: savedBill._id, status: "Completed" } },
        { new: true }
      );

      const modifiedEmp = await employee.updateOne(
        { _id: employeeId },
        { $unset: { currentOrder: "" } }
      );

      if (modifiedEmp.modifiedCount === 0) {
        // Rollback bill and order status
        await billing.findByIdAndDelete(savedBill._id);
        await order.findByIdAndUpdate(orderId, {
          $set: { status: "Progress" },
        });

        return res
          .status(500)
          .json({ message: "Employee update failed, rolled back changes." });
      }

      return res.status(201).json({ message: "Status updated" });
    } catch (err) {
      console.error("Error in status update:", err);
      return res.status(500).json({ message: err.message });
    }
  } else if (status === "progress") {
    try {
      const updatedOrder = await order.findByIdAndUpdate(
        orderId,
        { $set: { status: "Progress", addressedBy: employeeId } },
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(400).json({ message: "Order not found" });
      }

      await employee.updateOne(
        { _id: employeeId },
        { $set: { currentOrder: orderId } }
      );

      return res.status(201).json({ message: "Status updated" });
    } catch (err) {
      console.error("Error in progress status update:", err);
      return res.status(500).json({ message: err.message });
    }
  } else {
    return res.status(400).json({ message: "Invalid status value" });
  }
};

export const deleteOrder = async (req, res) => {
  const orderId = req.params.id;
  if (!orderId) {
    return res.status(400).json({ message: "Order id not provided" });
  }
  try {
    await order.findByIdAndDelete(orderId);
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createOrder = async (req, res) => {
  //Add an address
  const {
    name,
    email,
    phone,
    issue,
    category,
    service,
    deliveryTime,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    pinCode,
  } = req.body;
  console.log("llll", req.body);
  if (!name || (!service && !category) || !issue) {
    return res.status(400).json({ message: "Please enter required fields" });
  }
  if (!email && !phone) {
    return res
      .status(400)
      .json({ message: "Please enter either email or phone number" });
  }
  if((!addressLine1 && !addressLine2) || !city || !landmark || !pinCode){
    return res.status(400).json({ message: "Please enter complete address" });
  }
  try {
    const existingOrder = await order
      .findOne({ phone })
      .sort({ createdAt: -1 });
    if (
      existingOrder &&
      !(
        existingOrder.status == "Completed" ||
        existingOrder.status == "Cancelled"
      )
    ) {
      return res.status(500).json({ message: "Order exists" });
    }
    let createOrder;
    if (deliveryTime) {
      createOrder = new order({
        name,
        email,
        phone,
        issue,
        serviceCategory: category,
        parentService: service,
        deliveryTime: new Date(deliveryTime),
        status: "Pending",
        address: {
          addressLine1,
          addressLine2,
          landmark,
          city,
          state,
          pinCode,
        },
      });
    } else {
      createOrder = new order({
        name,
        email,
        phone,
        issue,
        serviceCategory: category,
        parentService: service,
        status: "Pending",
        address: {
          addressLine1,
          addressLine2,
          landmark,
          city,
          state,
          pinCode,
        },
      });
    }
    const created=await createOrder.save();
    notifyOrderDetails(createOrder);
    return res.status(201).json({ message: "Order successfully created", orderId: created._id });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};
