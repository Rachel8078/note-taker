const fs = require('fs');
const path = require('path');

const express = require('express');
const PORT = process.env.PORT || 3001;
const app = express();

// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));
// parse incoming JSON data
app.use(express.json());
app.use(express.static('public'));

// Create a note
function createNote(body, notesArray) {
    const note = body;
    notesArray.push(note);
    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify({ notes: notesArray }, null, 2)
    );

    // return finished code to post route for response
    return note;
}

// Validate that notes have a title and text content
function validateNote(note) {
    if(!note.title || typeof note.title !== 'string') {
        return false;
    }
    if(!note.text || typeof note.text !== 'string') {
        return false;
    }
    return true;
}

// Load all previous notes
app.get('/api/notes', (req, res) => {
    const { notes } = JSON.parse(fs.readFileSync(
        path.join(__dirname, './db/db.json')))
    console.log(req.query)
    res.json(notes);
});

// Create a note
app.post('/api/notes', (req, res) => {
    const { notes } = JSON.parse(fs.readFileSync(
        path.join(__dirname, './db/db.json')))
    // req.body is where incoming content will be
    // set id based on what the next index of the array will be
    req.body.id = notes.length.toString();

    // if any data in req.body in incorrect, send 400 error 
    if (!validateNote(req.body)) {
        res.status(400).send('The note is not properly formatted.');
    } else {
    // add note to json file and notes array
    const note = createNote(req.body, notes);
    res.json(note);
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

// Send wildcard routes to homepage
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.delete('/api/notes/:id', (req, res) => {
    const { notes } = JSON.parse(fs.readFileSync(
        path.join(__dirname, './db/db.json')))
    const filteredNotes = 
    notes.filter(note => 
        note.id !== req.params.id
    );
        console.log(filteredNotes);
        fs.writeFileSync(
            path.join(__dirname, './db/db.json'),
            JSON.stringify({ notes: filteredNotes }, null, 2)
        );
        res.json(filteredNotes);
})

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});
