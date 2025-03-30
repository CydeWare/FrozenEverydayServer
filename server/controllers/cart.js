// import Cart from "../model/cart.js"
// import mongoose from 'mongoose';
import db from "../db.js";

const getCartItems = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM CartItems");

    res.status(201).json(rows);
  } catch (error) {
    res.status(409).json({ success: false, message: error.message });
  }
};

const getCartItemsByUserID = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Find the Cart for the User
    const [cart] = await db.query("SELECT CartID FROM Cart WHERE UserID = ?", [
      id,
    ]);

    if (cart.length === 0) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const CartID = cart[0].CartID;

    // Step 2: Get all Cart Items and their Product Images
    const [cartItems] = await db.query(
      `
      SELECT 
        ci.CartItemID, 
        ci.ProductID, 
        p.Title, 
        ci.Quantity, 
        ci.Price, 
        ci.Variant,
        f.FileID, 
        f.FileData 
      FROM CartItems ci
      JOIN Products p ON ci.ProductID = p.ProductID
      LEFT JOIN File f ON ci.ProductID = f.ProductID
      WHERE ci.CartID = ?
    `,
      [CartID]
    );

    // Step 3: Group images for each cart item
    const cartItemsMap = {};

    cartItems.forEach((item) => {
      const {
        CartItemID,
        ProductID,
        Title,
        Quantity,
        Price,
        Variant,
        FileID,
        FileData,
      } = item;

      if (!cartItemsMap[CartItemID]) {
        cartItemsMap[CartItemID] = {
          CartItemID,
          ProductID,
          Title,
          Quantity,
          Price,
          Variant,
          Files: [],
        };
      }

      if (FileID) {
        cartItemsMap[CartItemID].Files.push({ FileID, FileData });
      }
    });

    const finalCartItems = Object.values(cartItemsMap);

    res.status(200).json(finalCartItems);
  } catch (error) {
    res.status(409).json({ success: false, message: error.message });
  }
};

const createCartItem = async (req, res) => {
  try {
    const { UserID, ProductID, Quantity, Variant, Price } = req.body;

    console.log("User ID From Creating Cart: ", UserID);

    // Step 1: Find or Create Cart for User
    let [cart] = await db.query("SELECT CartID FROM Cart WHERE UserID = ?", [
      UserID,
    ]);

    let CartID;
    if (cart.length === 0) {
      // Create a new cart if it doesn't exist
      const [rowsID] = await db.execute(
        "SELECT MAX(CartID) AS maxId FROM Cart"
      );

      let maxCartId = rowsID[0]?.maxId;

      if (!maxCartId) {
        maxCartId = "CA000";
      }

      CartID =
        "CA" +
        (parseInt(maxCartId.substring(2)) + 1).toString().padStart(3, "0");

      const [result] = await db.query(
        "INSERT INTO Cart (CartID, UserID) VALUES (?, ?)",
        [CartID, UserID]
      );
    } else {
      CartID = cart[0].CartID;
    }

    // Step 2: Check if the Product Exists
    const [product] = await db.query(
      "SELECT * FROM Products WHERE ProductID = ?",
      [ProductID]
    );
    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // const Price = product[0].Price;
    // const Price = productPrice * Quantity;

    //If there is Variant
    let result;

    let cartItems;

    if (Variant.length > 0) {
      let [cartItem] = await db.query(
        "SELECT * FROM CartItems WHERE CartID = ? AND ProductID = ? AND Variant = ?",
        [CartID, ProductID, Variant]
      );

      if (cartItem.length > 0) {
        // If product already in cart, update quantity
        await db.query(
          "UPDATE CartItems SET Quantity = Quantity + ? WHERE CartID = ? AND ProductID = ? AND Variant = ?",
          [Quantity, CartID, ProductID, Variant]
        );

        cartItems = await db.query(
          `
              SELECT 
                ci.CartItemID, 
                ci.ProductID, 
                p.Title, 
                ci.Quantity, 
                ci.Price, 
                ci.Variant,
                f.FileID, 
                f.FileData 
              FROM CartItems ci
              JOIN Products p ON ci.ProductID = p.ProductID
              LEFT JOIN File f ON ci.ProductID = f.ProductID
              WHERE ci.CartID = ? AND ci.ProductID = ?
            `,
          [CartID, ProductID]
        );

        result = await db.query(
          "SELECT * FROM CartItems WHERE CartID = ? AND ProductID = ?",
          [CartID, ProductID]
        );
      } else {
        // If not in cart, add new cart item

        const [rows] = await db.execute(
          "SELECT MAX(CartItemID) AS maxId FROM CartItems"
        );

        let maxCartItemId = rows[0]?.maxId;

        if (!maxCartItemId) {
          maxCartItemId = "CI000";
        }

        const CartItemID =
          "CI" +
          (parseInt(maxCartItemId.substring(2)) + 1)
            .toString()
            .padStart(3, "0");

        await db.query(
          "INSERT INTO CartItems (CartItemID, CartID, ProductID, Quantity, Price, Variant) VALUES (?, ?, ?, ?, ?, ?)",
          [CartItemID, CartID, ProductID, Quantity, Price, Variant]
        );

        cartItems = await db.query(
          `
              SELECT 
                ci.CartItemID, 
                ci.ProductID, 
                p.Title, 
                ci.Quantity, 
                ci.Price, 
                ci.Variant,
                f.FileID, 
                f.FileData 
              FROM CartItems ci
              JOIN Products p ON ci.ProductID = p.ProductID
              LEFT JOIN File f ON ci.ProductID = f.ProductID
              WHERE ci.CartItemID = ?
            `,
          [CartItemID]
        );

        result = await db.query(
          "SELECT * FROM CartItems WHERE CartItemID = ?",
          [CartItemID]
        );
      }
    } else {
      let [cartItem] = await db.query(
        "SELECT * FROM CartItems WHERE CartID = ? AND ProductID = ?",
        [CartID, ProductID]
      );

      if (cartItem.length > 0) {
        // If product already in cart, update quantity
        await db.query(
          "UPDATE CartItems SET Quantity = Quantity + ? WHERE CartID = ? AND ProductID = ?",
          [Quantity, CartID, ProductID]
        );

        cartItems = await db.query(
          `
              SELECT 
                ci.CartItemID, 
                ci.ProductID, 
                p.Title, 
                ci.Quantity, 
                ci.Price, 
                ci.Variant,
                f.FileID, 
                f.FileData 
              FROM CartItems ci
              JOIN Products p ON ci.ProductID = p.ProductID
              LEFT JOIN File f ON ci.ProductID = f.ProductID
              WHERE ci.CartID = ? AND ci.ProductID = ?
            `,
          [CartID, ProductID]
        );

        result = await db.query(
          "SELECT * FROM CartItems WHERE CartID = ? AND ProductID = ?",
          [CartID, ProductID]
        );
      } else {
        // If not in cart, add new cart item

        const [rows] = await db.execute(
          "SELECT MAX(CartItemID) AS maxId FROM CartItems"
        );

        let maxCartItemId = rows[0]?.maxId;

        if (!maxCartItemId) {
          maxCartItemId = "CI000";
        }

        const CartItemID =
          "CI" +
          (parseInt(maxCartItemId.substring(2)) + 1)
            .toString()
            .padStart(3, "0");

        await db.query(
          "INSERT INTO CartItems (CartItemID, CartID, ProductID, Quantity, Price) VALUES (?, ?, ?, ?, ?)",
          [CartItemID, CartID, ProductID, Quantity, Price]
        );

        cartItems = await db.query(
          `
              SELECT 
                ci.CartItemID, 
                ci.ProductID, 
                p.Title, 
                ci.Quantity, 
                ci.Price, 
                ci.Variant,
                f.FileID, 
                f.FileData 
              FROM CartItems ci
              JOIN Products p ON ci.ProductID = p.ProductID
              LEFT JOIN File f ON ci.ProductID = f.ProductID
              WHERE ci.CartItemID = ?
            `,
          [CartItemID]
        );

        result = await db.query(
          "SELECT * FROM CartItems WHERE CartItemID = ?",
          [CartItemID]
        );
      }
    }

    // Step 3: Check if Item Already Exists in Cart

    cartItems = cartItems[0];

    // console.log("CART CREATED! ", result);

    const cartItemsMap = {};

    cartItems.forEach((item) => {
      const {
        CartItemID,
        ProductID,
        Title,
        Quantity,
        Price,
        Variant,
        FileID,
        FileData,
      } = item;

      if (!cartItemsMap[CartItemID]) {
        cartItemsMap[CartItemID] = {
          CartItemID,
          ProductID,
          Title,
          Quantity,
          Price,
          Variant,
          Files: [],
        };
      }

      if (FileID) {
        cartItemsMap[CartItemID].Files.push({ FileID, FileData });
      }
    });

    const finalCartItems = Object.values(cartItemsMap);

    console.log("Result AFTER CREATING: ", finalCartItems);

    res.status(200).json(result[0][0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params; // Get CartItemID from request params
    const { Quantity, Price } = req.body; // Get updated values from request body

    // Step 1: Check if the CartItem exists
    const [cartItem] = await db.query(
      "SELECT * FROM CartItems WHERE CartItemID = ?",
      [id]
    );

    if (cartItem.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // Step 2: Update the CartItem (only update fields that were provided)
    await db.query("UPDATE CartItems SET Quantity = ? WHERE CartItemID = ?", [
      Quantity,
      id,
    ]);

    const [cartItems] = await db.query(
      `
      SELECT 
        ci.CartItemID, 
        ci.ProductID, 
        p.Title, 
        ci.Quantity, 
        ci.Price, 
        ci.Variant,
        f.FileID, 
        f.FileData 
      FROM CartItems ci
      JOIN Products p ON ci.ProductID = p.ProductID
      LEFT JOIN File f ON ci.ProductID = f.ProductID
      WHERE ci.CartItemID = ?
    `,
      [id]
    );

    // const [result] = await db.query("SELECT * FROM CartItems WHERE CartItemID = ?", [id]);

    const cartItemsMap = {};

    cartItems.forEach((item) => {
      const {
        CartItemID,
        ProductID,
        Title,
        Quantity,
        Price,
        Variant,
        FileID,
        FileData,
      } = item;

      if (!cartItemsMap[CartItemID]) {
        cartItemsMap[CartItemID] = {
          CartItemID,
          ProductID,
          Title,
          Quantity,
          Price,
          Variant,
          Files: [],
        };
      }

      if (FileID) {
        cartItemsMap[CartItemID].Files.push({ FileID, FileData });
      }
    });

    const finalCartItems = Object.values(cartItemsMap);

    console.log("Result AFTER UPDATING: ", finalCartItems);

    res.status(200).json(finalCartItems[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params; // Get CartItemID from request params

    // Step 1: Check if the CartItem exists
    const [cartItem] = await db.query(
      "SELECT * FROM CartItems WHERE CartItemID = ?",
      [id]
    );

    if (cartItem.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // Step 2: Delete the CartItem
    await db.query("DELETE FROM CartItems WHERE CartItemID = ?", [id]);

    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting cart item" });
  }
};

export {
  getCartItems,
  createCartItem,
  updateCartItem,
  deleteCartItem,
  getCartItemsByUserID,
};
