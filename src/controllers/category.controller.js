import Category from '../models/category.model.js';

// Add a new category
const categoryAdd = (req, res) => {
    const category = new Category({
        name: req.body.name,
        description: req.body.description
    });

    category.save()
    .then(category => {
        res.status(200).json({
            msg: "Category added successfully",
            data: category
        });
    })
    .catch(error => {
        res.status(400).json({
            msg: "Category not added",
            error
        });
    });
};

// Get all categories
const getAllCategories = (req, res) => {
    Category.find()
    .then(categories => {
        res.status(200).json({
            data: categories
        });
    })
    .catch(error => {
        res.status(400).json({
            msg: "Error retrieving categories",
            error
        });
    });
};

// Get a single category by ID
const getCategoryById = (req, res) => {
    Category.findById(req.params.id)
    .then(category => {
        if (category) {
            res.status(200).json({
                data: category
            });
        } else {
            res.status(404).json({
                msg: "Category not found"
            });
        }
    })
    .catch(error => {
        res.status(400).json({
            msg: "Error retrieving category",
            error
        });
    });
};

// Update a category
const updateCategory = (req, res) => {
    Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(category => {
        res.status(200).json({
            msg: "Category updated successfully",
            data: category
        });
    })
    .catch(error => {
        res.status(400).json({
            msg: "Error updating category",
            error
        });
    });
};

// Delete a category
const deleteCategory = (req, res) => {
    Category.findByIdAndDelete(req.params.id)
    .then(result => {
        if (result) {
            res.status(200).json({
                msg: "Category deleted successfully"
            });
        } else {
            res.status(404).json({
                msg: "Category not found"
            });
        }
    })
    .catch(error => {
        res.status(400).json({
            msg: "Error deleting category",
            error
        });
    });
};

export default { categoryAdd, getAllCategories, getCategoryById, updateCategory, deleteCategory };
