const asyncHandler =(requestHandler)=>{
    (req, res, next) =>{
        Promise.resolve(requestHandler( rex, res, next))
        .catch((err)=>
            next(err)
        )
    }
}

export {asyncHandler}