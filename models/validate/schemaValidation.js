const Joi = require("joi");
const trainDetails = require("../trainDetails");



module.exports.accountValidation = Joi.object({
    account: Joi.object({
        username: Joi.string().required(),
        firstname: Joi.string().required(),
        mobileNum: Joi.number().required(),
        personalEmailId: Joi.string().email().required(),
        addressone:Joi.string().required(),
        addresstwo: Joi.string().required(),
        state: Joi.string().required(),
        country: Joi.string().required(),
        pin: Joi.number().required(),
        password: Joi.string().required().min(8),
        confirmPass: Joi.string().required().min(8),
        }).required()
});

module.exports.trainEdit = Joi.object({
    trainDetails: Joi.object({
        trainNum: Joi.number().required().max(99999),
        trainName: Joi.string().required(),
        from: Joi.string().required(),
        to: Joi.string().required(),
        departureTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
        arrivalTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
        totalSeats: Joi.number().required(),
        haltingStations: Joi.array().items(
            Joi.object({
                stationName: Joi.string().required(),
                haltTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(), // Optional: e.g., 10:30
                order: Joi.number().integer().min(1).required() // Order of the station
            })
        ).required()
    }).required()
})


module.exports.bookingSchema = Joi.object({
    // child: Joi.number().min(0).max(5).required()
    //     .messages({
    //         'number.base': 'Please enter a valid number of children',
    //         'number.min': 'The number of children cannot be less than 0',
    //         'number.max': 'The number of children cannot exceed 5',
    //         'any.required': 'Please enter the number of children'
    //     }),

    passangers: Joi.object({
        adult: Joi.number().min(1).max(5).required()
            .messages({
                'number.base': 'Please enter a valid number of adults',
                'number.min': 'The number of adults cannot be less than 1',
                'number.max': 'The number of adults cannot exceed 5',
                'any.required': 'Please enter the number of adults'
        }),
    }).required()
});



