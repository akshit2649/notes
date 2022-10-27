const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");

//@desc Get all notes
//route GET /notes
//@access Private
const getAllNotes = asyncHandler(async (req, res) => {
  //Get all notes from MongoDB
  const notes = await Note.find().lean();

  //If no notes
  if (!notes?.length) {
    res.status(400).json({ message: "No notes found" });
  }

  //Add usrname to each note before sending the response
  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, userName: user.userName };
    })
  );

  res.json(notesWithUser);
});

//@desc Create new note
// route POST /notes
//@access Private
const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;

  //confirm data
  if (!user || !title || !text)
    return res.status(400).json({ message: "All fields are required" }); //400-> Bad Request

  //Check for duplicates
  const duplicate = await Note.findOne({ title }).lean().exec();

  if (duplicate)
    return res.status(409).json({ message: "Duplicate note title" }); //409-> request could not be processed due to conflict

  //Create and save new note
  const note = await Note.create({ user, title, text });

  if (note) {
    //Created
    return res.json({ message: "New note created" });
  } else {
    return res.status(400).json({ message: "Invalid note data received" });
  }
});

//@desc Updata a note
//Route PATCH /notes
//@access Private
const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  //confirm data
  if (!id || !user || !title || !text || typeof completed !== "boolean") {
    return res.status(400).json({ message: "All feilds are required" });
  }

  //confirm note exist to update
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  //check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec();

  //Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  res.json(`'${updatedNote.title}' updated`);
});

//@desc Delete a note
//Route DELETE /notes
//@access Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) return res.status(400).json({ message: "Note ID required" });

  const note = await Note.findById({ id }).exec();

  if (!note) return res.status(400).json({ message: "Note not found" });

  const result = await note.deleteOne();

  const reply = `Note '${result.title}' with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = { getAllNotes, createNewNote, updateNote, deleteNote };
