export async function findOne ({
        model , 
        filters = {},
        select = "",
        populate = false , 
        populateField = "" ,
}) {
    let result;

    if(populate){
        result = await model.findOne(filters).select(select).populate(populateField);
    }
    else{
        result = await model.findOne(filters).select(select);
    }

    return result;
}

export async function create ({model , insertedData , options = {}}) {
    const [result] = await model.create([insertedData] , options);
    return result;
};

export async function findById  ({ model, id }) {
    return await model.findById(id);
};