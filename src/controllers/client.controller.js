import clientSchema from '../models/client.model.js';

let clientAdd = (req, res) => {
    const client = new clientSchema({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        phone: req.body.phone
    });

    client.save()
    .then(d => {
        res.status(200).json({
            msg: "Client added Successfully",
            data: req.body
        });
    })
    .catch(e => {
        res.status(400).json({
            msg: "Client not added Successfully",
            error: e
        });
    });
};

export default { clientAdd }