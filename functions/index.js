const functions = require('firebase-functions');
const admin = require('firebase-admin');
// admin.initializeApp(functions.config().firebase);
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: true }));

// Add middleware to authenticate requests
// app.use(myMiddleware);

app.post('/getGames', async (req, res) => {
    console.log('/getGames');
    try {
        let { uid } = req.body;
        let items = [];
        uid = uid.toString();

        const snapshot = await db
            .collection('games')
            .where('author', '==', uid)
            .get();

        snapshot.docs.forEach(doc => {
            items.push(doc.data());
        });

        if (snapshot.empty) {
            res.send('No documents');
        } else {
            items = items.sort();
            res.send(items);
        }
    } catch (err) {
        res.send('Unable to get games');
    }
});
app.post('/addGame', async (req, res) => {
    try {
        console.log('/addGame');
        const { name, uid } = req.body;
        const data = {
            gameName: name,
            author: uid
        };

        const gameRef = await db.collection('games').add(data);
        const game = await gameRef.get();
        res.json({ message: 'Game added successfully', data: game });
    } catch (error) {
        res.status(500).send('Unable to add game', error);
    }
});
app.delete('/deleteGame/:id', async (req, res) => {
    try {
        console.log(`/deleteGame/${req.params.id}`);
        const { id } = req.params;

        const questions = await db
            .collection('questions')
            .where('gameID', '==', id)
            .get();
        let questionIDs = [];
        questions.docs.forEach(doc => {
            questionIDs.push(doc.id);
        });
        if (questionIDs.length > 0) {
            questionIDs.forEach(id => {
                db.collection('questions')
                    .doc(id)
                    .delete();
            });
            await db
                .collection('games')
                .doc(id)
                .delete();
        } else {
            await db
                .collection('games')
                .doc(id)
                .delete();
        }

        res.status(204).json({ message: 'Game Delete Successfull' });
    } catch (error) {
        res.status(500).send(error);
    }
});
app.post('/addQuestion', async (req, res) => {
    console.log('/addQuestion');
    const { question, answer, gameID, uid } = req.body;

    db.collection('questions')
        .add({
            question: question,
            answer: answer,
            gameID: gameID,
            author: uid
        })

        .then(
            console.log('Question add successfull'),
            res.send('Question add successfull')
        )
        .catch(error => {
            console.log('Unable to add question'),
                res.send('Unable to add question', error);
        });
});
app.delete('/deleteQuestion/', (req, res) => {
    console.log('/deleteQuestion');
    const { id } = req.body;

    db.collection('questions')
        .doc(id)
        .delete()
        .then(res.send('Document successfully deleted!'))
        .catch(error => {
            res.send('Unable to delete game');
        });
});

exports.jeopardy = functions.https.onRequest(app);
