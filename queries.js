const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');


const {
    pool
} = require('./config');

const resolveRequestParamsErrors = (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    }
    return false;
}

const resolveRequestAuthErrors = (request, response) => {
    if (!request.header('apiKey') || request.header('apiKey') !== process.env.API_KEY) {
        return response.status(401).json({
            status: 'error',
            message: 'Unauthorized.'
        })
    }
    return false;
}

const getRooms = async (request, response) => {

    const authErrors = await resolveRequestAuthErrors(request, response);

    if (!authErrors) {
        pool.query('SELECT * FROM rooms ORDER BY id ASC', (error, results) => {
            if (error) {
                throw error
            }

            results.rows.forEach(el => {
                el.image = JSON.parse(el.image);
            })

            response.status(200).json(results.rows);
        })
    }

}

const getRoomById = async (request, response) => {
    const id = request.params.id;
    const authErrors = await resolveRequestAuthErrors(request, response);
    const paramsErrors = await resolveRequestParamsErrors(request, response);

    if (!authErrors && !paramsErrors) {
        pool.query('SELECT * FROM rooms WHERE id = $1', [id], (error, results) => {
            if (error) {
                throw error
            }
            results.rows.forEach(el => {
                el.image = JSON.parse(el.image);
            })

            response.status(200).json(results.rows)
        })
    }
}

const createRoom = async (request, response) => {
    const {
        name,
        description,
        equipment,
        image,
        size,
        price
    } = request.body

    const authErrors = await resolveRequestAuthErrors(request, response);
    const paramsErrors = await resolveRequestParamsErrors(request, response);

    if (!authErrors && !paramsErrors) {
        pool.query('INSERT INTO rooms (name, description, equipment, image, size, price) VALUES ($1, $2, $3, $4, $5, $6)',
            [name, description, equipment, image, size, price],
            (error, results) => {
                if (error) {
                    throw error
                }
                response.status(201).send(`Room added with ID: ${results.insertId}`)
            })
    }
}



const updateRoom = async (request, response) => {
    const id = parseInt(request.params.id)
    const {
        name,
        description,
        equipment,
        image,
        size,
        price
    } = request.body
    const authErrors = await resolveRequestAuthErrors(request, response);
    const paramsErrors = await resolveRequestParamsErrors(request, response);

    if (!authErrors && !paramsErrors) {
        pool.query(
            'UPDATE rooms SET name = $1, description = $2, equipment =$3, image =$4, size = $5, price =$6 WHERE id = $7',
            [name, description, equipment, image, size, price, id],
            (error, results) => {
                if (error) {
                    throw error
                }
                response.status(200).send(`Room modified with ID: ${id}`)
            }
        )
    }
}

const updateRole = async (request, response) => {
    const {
        id,
        role
    } = request.body

    const authErrors = await resolveRequestAuthErrors(request, response);
    const paramsErrors = await resolveRequestParamsErrors(request, response);

    if (!authErrors && !paramsErrors) {
        pool.query(
            'UPDATE users SET role = $2 WHERE id = $1', [id, role],
            (error, results) => {
                if (error) {
                    throw error
                }
                response.status(200).send(`Updated user with id ${id}`)
            }
        )
    }
}




const deleteRoom = async (request, response) => {
    const id = parseInt(request.params.id)
    const authErrors = await resolveRequestAuthErrors(request, response);
    const paramsErrors = await resolveRequestParamsErrors(request, response);

    if (!authErrors && !paramsErrors) {
        pool.query('DELETE FROM rooms WHERE id = $1', [id], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Room deleted with ID: ${id}`)
        })
    }
}

const getUsers = async (request, response) => {
    const authErrors = await resolveRequestAuthErrors(request, response);

    if (!authErrors) {
        pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        })
    }
}


const createUser = async (request, response) => {
    const {
        username,
        password
    } = request.body

    const authErrors = await resolveRequestAuthErrors(request, response);
    const paramsErrors = await resolveRequestParamsErrors(request, response);

    if (!authErrors && !paramsErrors) {

        const hashedPassword = bcrypt.hashSync(password, 8);

        pool.query('INSERT INTO users (username, role, password) VALUES ($1, $2, $3)', [username, 'user', hashedPassword], (error, results) => {
            if (error) {
                throw error
            }
            const token = jwt.sign({ id: username }, 'secretKey', {
                expiresIn: 86400
            });

            response.status(200).json({ 'username': username, auth: true, 'token': token, });
        })
    }
}

const updateUser = async (request, response) => {
    const {
        name,
        surname,
        street,
        city,
        postalcode
    } = request.body
    const id = request.params.id;

    const authErrors = await resolveRequestAuthErrors(request, response);
    const paramsErrors = await resolveRequestParamsErrors(request, response);

    if (!authErrors && !paramsErrors) {
        pool.query(
            'UPDATE users SET name = $1, surname = $2, street =$3, city =$4, postalcode = $5 WHERE id = $6',
            [name, surname, street, city, postalcode, id],
            (error, results) => {
                if (error) {
                    throw error
                }
                response.status(200).send(`User modified with ID: ${id}`)
            }
        )
    }
}

const getUser = async (request, response) => {
    const {
        username,
        password
    } = request.body

    const authErrors = await resolveRequestAuthErrors(request, response);
    const paramsErrors = await resolveRequestParamsErrors(request, response);

    if (!authErrors && !paramsErrors) {
        pool.query('SELECT * FROM users WHERE username = $1', [username], (error, results) => {
            if (error) {
                throw error
            }
            const passwordIsValid = bcrypt.compareSync(password, results.rows[0].password);
            if (!passwordIsValid) {
                return response.status(401).send({ auth: false, token: null });
            }
            const token = jwt.sign({ id: username }, 'secretKey', {
                expiresIn: 86400
            });
            pool.query(
                'UPDATE users SET token = $1 WHERE id = $2',
                [token, results.rows[0].id],
                (error, results) => {
                    if (error) {
                        throw error
                    }
                }
            )
            response.status(200).json({ 'user': results.rows[0], 'token': token, 'results': passwordIsValid })
        })
    }
}

const getToken = async (request, response) => {
    const token = request.body.token;
    pool.query('SELECT * FROM users WHERE token = $1', [token], (error, results) => {
        if (error) {
            response.status(404).send('User not found or token is expired.')
        }
        response.status(200).json({ 'user': results.rows[0] })
    })
}

const deleteUser = async (request, response) => {
    const id = parseInt(request.params.id);

    const authErrors = await resolveRequestAuthErrors(request, response);
    const paramsErrors = await resolveRequestParamsErrors(request, response);

    if (!authErrors && !paramsErrors) {
        pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`User deleted with ID: ${id}`)
        })
    }
}

const getReservations = async (request, response) => {
    const authErrors = await resolveRequestAuthErrors(request, response);

    if (!authErrors) {
        pool.query('SELECT * FROM reservations ORDER BY id ASC', (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows);
        })
    }
}

const getReservationByUserId = async (request, response) => {
    const id = parseInt(request.params.userId);

    const authErrors = await resolveRequestAuthErrors(request, response);
    const paramsErrors = await resolveRequestParamsErrors(request, response);

    if (!authErrors && !paramsErrors) {
        pool.query('SELECT * FROM reservations WHERE userId = $1', [id], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        })
    }
}

const createReservation = async (request, response) => {
    const {
        roomId,
        userId,
        name,
        surname,
        street,
        city,
        postalCode,
        startDate,
        endDate,
        days
    } = request.body

    const authErrors = await resolveRequestAuthErrors(request, response);
    const paramsErrors = await resolveRequestParamsErrors(request, response);

    if (!authErrors && !paramsErrors) {

        pool.query('INSERT INTO reservations (roomId, userId, name, surname, street, city, postalCode, startDate, endDate, days) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [roomId, userId ? userId : 0, name, surname, street, city, postalCode, startDate, endDate, days],
            (error, results) => {
                if (error) {
                    throw error
                }
                response.status(201).send(`Reservation added with ID: ${results.insertId}`)
            })
    }
}

const updateReservation = async (request, response) => {
    const id = parseInt(request.params.id)
    const {
        roomId,
        userId,
        name,
        surname,
        street,
        city,
        postalCode,
        startDate,
        endDate,
        days
    } = request.body

    const authErrors = await resolveRequestAuthErrors(request, response);
    const paramsErrors = await resolveRequestParamsErrors(request, response);

    if (!authErrors && !paramsErrors) {
        pool.query(
            'UPDATE reservations SET roomId = $1, userId = $2, name =$3, surname =$4, street = $5, city =$6, postalCode =$7, startTime =$8, endTime =$9, days=$10 WHERE id = $11',
            [roomId, userId, name, surname, street, city, postalCode, startDate, endDate, days, id],
            (error, results) => {
                if (error) {
                    throw error
                }
                response.status(200).send(`Reservation modified with ID: ${id}`)
            }
        )
    }
}


const deleteReservation = async (request, response) => {
    const id = parseInt(request.params.id);

    const authErrors = await resolveRequestAuthErrors(request, response);
    const paramsErrors = await resolveRequestParamsErrors(request, response);

    if (!authErrors && !paramsErrors) {
        pool.query('DELETE FROM reservations WHERE id = $1', [id], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`Reservation deleted with ID: ${id}`)
        })
    }
}

module.exports = {
    getRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    getUsers,
    createUser,
    getUser,
    deleteUser,
    getReservations,
    getReservationByUserId,
    createReservation,
    updateReservation,
    deleteReservation,
    updateRole,
    updateUser,
    getToken
}