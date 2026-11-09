import { Response, Request } from "express";
import Product, { IReview } from "../models/product.model";
import asyncHandler from "express-async-handler";

//const getProducts = async (req: Request, res: Response) => {
//  try {
//    const products = await Product.find({});
//    res.json(products);
//  } catch (error) {
//    res.status(500).json({ message: "Error al acceder el producto" });
//  }
//};

// endpoint para listar todos los productos
const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const pageSize = 8;
  const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword
    ? {
        name: {
          // aqui el regex da error por las diferentes versiones de mongoose
          $regex: req.query.keyword as string,
          $options: "i",
        },
      }
    : {};
  const count = await Product.countDocuments({ ...keyword });

  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  if (products) {
    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } else {
    res.status(500);
    throw new Error("Error al acceder a los productos");
  }
});

// endpoint para crear todos los productos
const createProduct = asyncHandler(async (req: Request, res: Response) => {
  // todo: indicar el usuario
  const product = {
    ...req.body,
    user: req.user!._id,
  };
  const newProduct = new Product(product);
  const saveProduct = await newProduct.save();

  if (saveProduct) {
    res.status(201).json(saveProduct);
  } else {
    res.status(500);
    throw new Error("Error al crear el producto");
  }
});

// endpoint para buscar por id todos los productos
const getProductsById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Producto no encontrado");
  } else {
    res.json(product);
  }
});

// endpoint para actualizar todos los productos
const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const updateProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );
  if (!updateProduct) {
    res.status(404);
    throw new Error("Producto no encontrado");
  } else {
    res.json(updateProduct);
  }
});

// endpoint para eliminar todos los productos
const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const deleteProduct = await Product.findByIdAndDelete(req.params.id);
  if (!deleteProduct) {
    res.status(404);
    throw new Error("Producto no encontrado");
  } else {
    res.json({ message: "Producto eliminado" });
  }
});

const createProductReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user!._id.toString(),
      );

      if (alreadyReviewed) {
        res.status(400);
        throw new Error("El producto ya fue valorado");
      }

      const review: IReview = {
        name: req.user!.name,
        rating: Number(rating),
        comment,
        // en el video se ve como
        // user: req.user!.id, pero a mi me funciona con _id
        user: req.user!._id,
      } as IReview;
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;
      await product.save();
      res.status(201).json({ message: "Valoracion agregada" });
    } else {
      res.status(404);
      throw new Error("Producto no encontrado");
    }
  },
);

export {
  getProducts,
  createProduct,
  getProductsById,
  updateProduct,
  deleteProduct,
  createProductReview,
};
