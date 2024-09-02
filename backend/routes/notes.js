const express = require('express')
const router = express.Router()
var fetchuser = require('../middleware/fetchuser.js')
const { body, validationResult } = require('express-validator');
const Notes = require('../models/Notes.js')

// Route 1
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id })
        res.json(notes)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal error")
    }
})

// Route 2
router.post('/addnote', fetchuser, [
    body("title", 'Enter a valid title').isLength({ min: 3 }),
    body("description", 'Description must be atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {

    try {
        const { title, description, tag } = req.body;
        const notes = await Notes.find({ user: req.user.id })


        // return error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Notes({
            title, description, tag, user: req.user.id
        })
        const savednote = await note.save()

        res.json(savednote)
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal error")
    }
})

// Route 3
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    try {
    const { title, description, tag } = req.body;
        const newnote = {};
        if (title) newnote.title = title
        if (description) newnote.description = description
        if (tag) newnote.tag = tag

        let note = await Notes.findById(req.params.id)
        if (!note) { return res.status(404).send("Not Found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(404).send("Not Allowed")
        }
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newnote }, { new: true })
        res.json(note);
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal error")
    }
})

// Route 4
router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    try {
        let note = await Notes.findById(req.params.id)
        if (!note) { return res.status(404).send("Not Found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(404).send("Not Allowed")
        }
        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted successfully", note: note });
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal error")
    }
})

module.exports = router;


