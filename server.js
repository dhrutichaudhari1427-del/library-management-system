require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();


// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });

// Book Schema
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    author: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    year: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        default: "Available"
    },

    issuedTo: {
        type: String,
        default: ""
    },

    issueDate: {
        type: String,
        default: ""
    }
});

const Book = mongoose.model("Book", bookSchema);


// ===============================
// HOME PAGE
// ===============================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ===============================
// GET ALL BOOKS
// ===============================

app.get("/api/books", async (req, res) => {

    try {

        const search = req.query.search || "";

        const books = await Book.find({
            $or: [
                { title: { $regex: search, $options: "i" } },
                { author: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } }
            ]
        }).sort({ _id: -1 });

        res.json(books);

    } catch (error) {

        res.status(500).json({
            message: "Error getting books"
        });

    }

});


// ===============================
// ADD BOOK
// ===============================

app.post("/api/books", async (req, res) => {

    try {

        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            category: req.body.category,
            year: req.body.year
        });

        const savedBook = await book.save();

        res.status(201).json(savedBook);

    } catch (error) {

        res.status(400).json({
            message: "Error adding book"
        });

    }

});


// ===============================
// UPDATE BOOK
// ===============================

app.put("/api/books/:id", async (req, res) => {

    try {

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title,
                author: req.body.author,
                category: req.body.category,
                year: req.body.year
            },
            { new: true }
        );

        res.json(updatedBook);

    } catch (error) {

        res.status(500).json({
            message: "Error updating book"
        });

    }

});


// ===============================
// DELETE BOOK
// ===============================

app.delete("/api/books/:id", async (req, res) => {

    try {

        await Book.findByIdAndDelete(req.params.id);

        res.json({
            message: "Book deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Error deleting book"
        });

    }

});


// ===============================
// ISSUE BOOK
// ===============================

app.patch("/api/books/:id/issue", async (req, res) => {

    try {

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            {
                status: "Issued",
                issuedTo: req.body.issuedTo,
                issueDate: new Date().toLocaleDateString()
            },
            { new: true }
        );

        res.json(updatedBook);

    } catch (error) {

        res.status(500).json({
            message: "Error issuing book"
        });

    }

});


// ===============================
// RETURN BOOK
// ===============================

app.patch("/api/books/:id/return", async (req, res) => {

    try {

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            {
                status: "Available",
                issuedTo: "",
                issueDate: ""
            },
            { new: true }
        );

        res.json(updatedBook);

    } catch (error) {

        res.status(500).json({
            message: "Error returning book"
        });

    }

});


// ===============================
// DASHBOARD STATISTICS
// ===============================

app.get("/api/stats", async (req, res) => {

    try {

        const total = await Book.countDocuments();

        const available = await Book.countDocuments({
            status: "Available"
        });

        const issued = await Book.countDocuments({
            status: "Issued"
        });

        res.json({
            total: total,
            available: available,
            issued: issued
        });

    } catch (error) {

        res.status(500).json({
            message: "Error getting statistics"
        });

    }

});


// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});