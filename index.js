const copy = t => JSON.parse(JSON.stringify(t));
const respond = (res, body) =>
  res.json( Object.assign({}, body, { payload: copy(body.payload) }) );

module.exports = {
  readAll: model => (req, res) =>
    model.findAll({
      attributes: req.query.attributes ?
                  [].concat(req.query.attributes) : undefined,
    })
         .then(rows =>
           respond(res, {
             model: model.name,
             payload: rows,
           }))
         .catch(err => res.status(err.code || 500).json({ err })),


  readOne: model => (req, res) =>
    model.find({ where: {
      id: ((req.body || {}).payload || {}).id || (req.params || {}).id,
    } })

         .then(row =>
           respond(res, {
             model: model.name,
             payload: [].concat(row || []),
           }))
         .catch(err => res.status(err.code || 500).json({ err })),


  create: model => (req, res) =>
    model.create(req.body.payload)
         .then(createdRow =>
           respond(res, {
             model: model.name,
             payload: [createdRow],
           }))
         .catch(err => res.status(err.code || 500).json({ err })),

  findOrCreate: model => (req, res) =>
    model.findOrCreate({
      where: req.body.payload.find,
      defaults: req.body.payload.create,
    })
         .then(row =>
           respond(res, {
             model: model.name,
             foundOrCreated: row[1] ? 'created' : 'found',
             payload: [].concat(row[0]),
           }))
         .catch(err => res.status(err.code || 500).json({ err })),

  patch: model => (req, res) =>
    model.findById(req.body.payload.id || req.params.id)

         .then(row =>
           (row ?
            row.update(req.body.payload /*, {fields:[]}*/)
               .then(patchedRow => respond(res, {
                 model: model.name,
                 payload: [patchedRow],
               })) :
            Promise.reject(model.name + ' with ' +
                           'id ' + (req.body.payload.id || req.params.id) +
                           ' not found')
           ))
         .catch(err => res.status(err.code || 500).json({ err })),

  query: model => (req, res) =>
    model.findAndCountAll({
      where: req.body.payload.where,
      offset: req.body.payload.offset || 0,
      limit: req.body.payload.limit || 666,
    })
         .then(rows =>
           respond(res, {
             model: `${model.name}-paginated`,
             payload: rows,
           }))
         .catch(err => res.status(err.code || 500).json({ err })),
};
