import db from "../db.js";
import multer from "multer";

const PORT = 5000;

// const storage = multer.diskStorage({
//     destination: "../uploads/videos/", // Store in local folder
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
//     }
// });
// const upload = multer({ storage });

const getProducts = async (req, res) => {
  try {
    const query = "SELECT * FROM Products";

    const [rows, field] = await db.execute(query);

    res.status(200).json(rows);
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = JSON.parse(req.body.product);
    const file = req.file;

    console.log("File: ", file);
    // console.log("File 1: ", req.file[0]);

    // for (let pair of file?.entries()) {
    //     console.log("Pairs", pair[0], pair[1]); // This will show the file
    // }

    console.log("Products: ", product);

    const [rows] = await db.execute(
      "SELECT MAX(ProductID) AS maxId FROM Products"
    );

    let maxId = rows[0]?.maxId;

    if (!maxId) {
      maxId = "PR000";
    }

    const id =
      "PR" + (parseInt(maxId.substring(2)) + 1).toString().padStart(3, "0");

    console.log("ID: ", id);
    console.log("Max ID: ", maxId);

    let description = product.description;

    if (product.description.length === 0) {
      description = "Makanan yang lezat dan enak!";
    }

    if (file) {
      const videoUrl = `http://localhost:${PORT}/videos/${file.filename}`;

      const query =
        "INSERT INTO Products (ProductID, Video, Title, Price, ItemsSold, Rating, Category, Description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

      await db.execute(query, [
        id,
        videoUrl,
        product.title,
        product.price,
        product.itemsSold,
        product.rating,
        product.category,
        description,
      ]);
    } else {
      const query =
        "INSERT INTO Products (ProductID, Video, Title, Price, ItemsSold, Rating, Category, Description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

      await db.execute(query, [
        id,
        null,
        product.title,
        product.price,
        product.itemsSold,
        product.rating,
        product.category,
        description,
      ]);
    }

    // const videoUrl = `http://localhost:${PORT}/videos/${file.filename}`;

    // const query = "INSERT INTO Products (ProductID, Video, Title, Price, ItemsSold, Rating, Category, Description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    // await db.execute(query, [id, videoUrl, product.title, product.price, product.itemsSold, product.rating, product.category, product.description]);

    for (let i = 0; i < product.selectedFile.length; i++) {
      const [fileMaxIDRows] = await db.execute(
        "SELECT MAX(FileID) AS maxId FROM File"
      );

      let maxFileID = fileMaxIDRows[0]?.maxId;

      if (!maxFileID) {
        maxFileID = "FI000";
      }

      const fileID =
        "FI" +
        (parseInt(maxFileID.substring(2)) + 1).toString().padStart(3, "0");

      console.log("File ID: ", fileID);

      await db.execute(
        "INSERT INTO File (FileID, ProductID, FileData) VALUES (?, ?, ?)",
        [fileID, id, product.selectedFile[i]]
      );
    }

    if (product.variants.length > 0) {
      for (let j = 0; j < product.variants.length; j++) {
        const [variantMaxIDRows] = await db.execute(
          "SELECT MAX(VariantID) AS maxId FROM Variant"
        );

        let maxVariantID = variantMaxIDRows[0]?.maxId;

        if (!maxVariantID) {
          maxVariantID = "VA000";
        }

        const variantID =
          "VA" +
          (parseInt(maxVariantID.substring(2)) + 1).toString().padStart(3, "0");

        console.log("Variant ID: ", variantID);

        await db.execute(
          "INSERT INTO Variant (VariantID, ProductID, VariantName, AdditionalPrice) VALUES (?, ?, ?, ?)",
          [
            variantID,
            id,
            product.variants[j],
            product.variantsPrice[j]
              ? product.variantsPrice[j] - product.price
              : 0,
          ]
        );
      }
    }

    res
      .status(200)
      .json({ success: true, message: "Product created successfully " });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getProductsBySearch = async (req, res) => {
  try {
    const { query, minPrice, maxPrice, category } = req.query;

    if (
      category &&
      category != "Semua Produk" &&
      category != "Cedea" &&
      category != "Paket Hemat" &&
      category != "Kanzler" &&
      category != "Cimory" &&
      category != "Buah Frozen" &&
      category != "Ikan Frozen" &&
      category != "Coklat"
    ) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found!" });
    }

    let sql;
    let params;

    if (category) {
      sql =
        "SELECT * FROM Products WHERE Category = ? AND (title LIKE ? OR description LIKE ?)";

      params = [category, `%${query}%`, `%${query}%`];
    } else {
      sql = "SELECT * FROM Products WHERE (title LIKE ? OR description LIKE ?)";

      params = [`%${query}%`, `%${query}%`];
    }

    // if (minPrice) {
    //   sql += " AND price >= ?";
    //   params.push(minPrice);
    // }
    // if (maxPrice) {
    //   sql += " AND price <= ?";
    //   params.push(maxPrice);
    // }

    const [products] = await db.execute(sql, params);

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
};

const getProductsByPagination = async (req, res) => {
  try {
    const { page = 1, limit = 12, category } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const offset = (pageNum - 1) * limitNum;

    const query = "SELECT * FROM Products LIMIT ? OFFSET ?";
    const params = [limitNum, offset];

    const [products] = await db.execute(
      "SELECT * FROM Products LIMIT ? OFFSET ?",
      [limitNum.toString(), offset.toString()]
    );

    const [[{ total }]] = await db.execute(
      "SELECT COUNT(*) as total FROM Products"
    );

    res.json({
      products,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      totalProducts: total,
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: error });
  }
};

const getSortedProducts = async (req, res) => {
  try {
    const {
      sortBy = "price",
      order = "desc",
      page = 1,
      limit = 12,
      category,
    } = req.query;

    const allowedSortFields = ["rating", "price", "itemsSold"];
    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sorting field" });
    }

    const limitNum = parseInt(limit, 10) || 12;
    const pageNum = parseInt(page, 10) || 1;

    const orderBy = order.toLowerCase() === "desc" ? "DESC" : "ASC";
    const offset = (parseInt(page) - 1) * parseInt(limit);

    if (
      category &&
      category != "Semua Produk" &&
      category != "Cedea" &&
      category != "Paket Hemat" &&
      category != "Kanzler" &&
      category != "Cimory" &&
      category != "Buah Frozen" &&
      category != "Ikan Frozen" &&
      category != "Coklat"
    ) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found!" });
    }

    let query;
    let params;

    if (category) {
        


        query = `SELECT * FROM products WHERE Category = ? ORDER BY ${sortBy} ${orderBy} LIMIT ? OFFSET ?`;

      params = [category, limit, offset.toString()];
    } else {
      query = `SELECT * FROM products ORDER BY ${sortBy} ${orderBy} LIMIT ? OFFSET ?`

        params = [limit, offset.toString()];
    }

    const [products] = await db.execute(query, params);

    let total;

    // Get total products count for pagination
    if (category) {
      [[{ total }]] = await db.execute(
        `SELECT COUNT(*) AS total FROM products WHERE Category = ?`,
        [category]
      );
    } else {
      [[{ total }]] = await db.execute(
        `SELECT COUNT(*) AS total FROM products`
      );
    }
    // const totalProducts = countResult[0].total;
    //     const totalPages = Math.ceil(totalProducts / limit);
    res.json({
      products,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      totalProducts: total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getProductsByPaginationAndCategory = async (req, res) => {
  try {
    const { page = 1, limit = 12, category } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const offset = (pageNum - 1) * limitNum;

    const query = "SELECT * FROM Products LIMIT ? OFFSET ?";
    const params = [limitNum, offset];

    let products;

    if (
      category &&
      category != "Semua Produk" &&
      category != "Cedea" &&
      category != "Paket Hemat" &&
      category != "Kanzler" &&
      category != "Cimory" &&
      category != "Buah Frozen" &&
      category != "Ikan Frozen" &&
      category != "Coklat"
    ) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found!" });
    }

    if (category) {
      [products] = await db.execute(
        "SELECT * FROM Products WHERE Category = ? LIMIT ? OFFSET ?",
        [category, limitNum.toString(), offset.toString()]
      );
    } else {
      [products] = await db.execute("SELECT * FROM Products LIMIT ? OFFSET ?", [
        limitNum.toString(),
        offset.toString(),
      ]);
    }

    let total;

    if (category) {
      [[{ total }]] = await db.execute(
        "SELECT COUNT(*) as total FROM Products WHERE Category = ?",
        [category]
      );
    } else {
      [[{ total }]] = await db.execute(
        "SELECT COUNT(*) as total FROM Products"
      );
    }
    // [[{ total }]] = await db.execute(
    //     "SELECT COUNT(*) as total FROM Products"
    // );

    res.json({
      products,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      totalProducts: total,
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: error });
  }
};

export {
  getProducts,
  createProduct,
  getProductsBySearch,
  getProductsByPagination,
  getSortedProducts,
  getProductsByPaginationAndCategory,
};
