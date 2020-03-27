const express = require('express');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const app = express();
const port = 3000;
const db = require('./queries')

app.use(bodyParser.json({ limit: '50mb' }));
app.use(
    bodyParser.urlencoded({
        limit: '50mb',
        extended: true
    })
);

app.get('/', (request, response) => {
    response.json({
        info: 'Node.js, Express, and Postgres API'
    })
});

app.get('/rooms', db.getRooms)

app.get('/rooms/:id', [
    check('id').isInt()
], db.getRoomById)

app.post('/rooms/new', [
    check('name').isLength({ min: 1 }),
    check('description').isLength({ min: 1 }),
    check('equipment').isLength({ min: 1 }),
    check('image').isLength({ min: 1 }),
    check('size').isInt(),
    check('price').isFloat(),
], db.createRoom)

app.put('/rooms/:id/update', [
    check('id').isInt(),
    check('name').isLength({ min: 1 }),
    check('description').isLength({ min: 1 }),
    check('equipment').isLength({ min: 1 }),
    check('image').isLength({ min: 1 }),
    check('size').isInt(),
    check('price').isFloat(),
], db.updateRoom)

app.delete('/rooms/:id/delete', [
    check('id').isInt()
], db.deleteRoom)

app.get('/users', db.getUsers)

app.post('/users/new', [
    check('username').isLength({ min: 1 }),
    check('password').isLength({ min: 8 })
], db.createUser)

app.put('/users/:id/update', [
    check('id').isInt()
], db.updateUser)

app.post('/login', [
    check('username').isLength({ min: 1 }),
    check('password').isLength({ min: 8 })
], db.getUser)

app.post('/updateRole', [
    check('id').isInt(),
    check('role').isIn(['user', 'admin'])
], db.updateRole)

app.delete('/users/:id/delete', [
    check('username').isInt()
], db.deleteUser)

app.get('/reservations', db.getReservations)

app.post('/reservations/new', [
    check('roomId').isInt(),
    check('userId').isInt(),
    check('name').isLength({ min: 1 }),
    check('surname').isLength({ min: 1 }),
    check('street').isLength({ min: 1 }),
    check('city').isLength({ min: 1 }),
    check('postalCode').isLength({ min: 1 }),
    check('startDate').isLength({ min: 1 }),
    check('endDate').isLength({ min: 1 }),
], db.createReservation)

app.put('/reservations/update', [
    check('id').isInt(),
    check('roomId').isInt(),
    check('userId').isInt(),
    check('username').isLength({ min: 1 }),
    check('surname').isLength({ min: 1 }),
    check('street').isLength({ min: 1 }),
    check('city').isLength({ min: 1 }),
    check('postalCode').isLength({ min: 1 }),
    check('startDate').isLength({ min: 1 }),
    check('endDate').isLength({ min: 1 }),
], db.updateReservation)

app.get('/reservations/:userId', [
    check('userId').isInt()
], db.getReservationByUserId)

app.post('/authToken', [
    check('token').isLength({ min: 1 }),
], db.getToken)

app.delete('/reservations/:id/delete', [
    check('id').isInt()
], db.deleteReservation)


app.listen(process.env.PORT || 3002, () => {
    console.log(`Server listening`)
});