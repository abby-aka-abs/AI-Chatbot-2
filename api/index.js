const OpenAI = require('openai');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

const Message = require('./models/message');
const Conversation = require('./models/conversation');


mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;

const app = express();
app.use(bodyParser.json());
app.use(cors());

const openai = new OpenAI({
    apiKey: process.env.API_KEY
})




app.post('/message/:id',(req,res) => {
    if (req.params.id === 'new'){
        new Conversation().save().then((conversation) => {
            new Message({
                role: 'user',
                content: req.body.message.content,
                conversation: conversation._id
            }).save().then(() =>{
                openai.createChatCompletion({
                    model: 'gpt-3.5-turbo',
                    messages: [req.body.message],
                }).then((data) => {
                    new Message({
                        role: 'assistant',
                        content: data.data.choices[0].message.content,
                        conversation: conversation._id
                    }).save().then(() =>{
                        res.send({
                            message: data.data.choices[0].message.content,
                            conversation: conversation._id
                        })

                    })
                })
            })
            
        })

    }else {
        Conversation.findById(req.params.id).then((conversation) =>{
            Message.find({conversation: conversation._id}).sort({timestamp: -1}).limit(5).then((messages) => {
                new Message({
                    role: 'user',
                    content: req.body.message.content,
                    conversation: conversation._id
                }).save().then(() =>{
                    openai.createChatCompletion({
                        model: 'gpt-3.5-turbo',
                        messages: [...messages.map((message) => {return {content: message.content, role: message.role}}).reverse(), req.body.message]
                    }).then((data) =>{
                        new Message({
                            role: 'assistant',
                            content: data.data.choices[0].message.content,
                            conversation: conversation._id
                        }).save().then(() =>{
                            res.send({message:data.data.choices[0].message.content});
                        })
                    })
                })
            })
        })
    }


})

app.get('/conversation/:id', (req,res) => {
    Conversation.findById(req.params.id).then((conversation) => {
        Message.find({conversation: conversation._id}).then((messages) =>{
            res.send(messages);
        })
    })
});

app.delete('/conversation/:id', (req,res) => {
    Message.deleteMany({conversation: req.params.id}).then(()=>{
        Conversation.findByIdAndDelete(req.params.id).then(() =>{
            res.send('Conversation deleted')
        })
    })
})

app.listen(3000, () => {
    console.log('Server started on port 3000');
})