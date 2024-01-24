const express = require('express')
const router = express.Router();
const fetchuser = require('../middleware/fetchuser')
const Note = require('../models/Note')
const {body, validationResult} = require('express-validator')


//route 1: get all the notes GET:login required
router.get('/fetchallnotes',fetchuser, async (req,res)=>{
    try {
        const notes  = await Note.find({user:req.user.id})
        res.json(notes)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})

//route 2: Add new note POST /addnote :login required
router.post('/addnote',fetchuser,[
    body('title','Enter a Valid Title').isLength({min:3}),
    body('description','Description must be atleast 5 characters').isLength({min :5})
], async (req,res)=>{
    try{
        const {title, description, tag} = req.body
        //if there are error return bad request
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        const note = new Note({
            title, description, tag, user : req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote)
    }catch(error){
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})

//route 3: Update a note PUT: /api/notes/updatenote :login required
router.put('/updatenote/:id',fetchuser,async (req,res) =>{
    const {title, description, tag} = req.body
    try{
        const newNote ={}
        if(title){newNote.title = title}
        if(description){newNote.description = description}
        if(tag){newNote.tag = tag}
        
        //find a note and update it
        let note = await Note.findById(req.params.id)
        if(!note){return res.status(404).send("Not Found")}

        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed")
        }
        note = await Note.findByIdAndUpdate(req.params.id, {$set : newNote},{new:true})
        res.json({note})
    }catch(error){
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }


})

//route 4 : Delete an existing note DELETE /api/notes/deletenode
router.delete('/deletenote/:id',fetchuser,async (req,res) =>{
    try{
        //find a note and delete it
        let note = await Note.findById(req.params.id)
        if(!note){return res.status(404).send("Not Found")}

        //Allow deletion only if user is owner
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed")
        }
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({"succss":"Note has been deleted"})
    }catch(error){
        console.error(error.message)
        res.status(500).send("Internal Server Error")
    }
})
module.exports = router