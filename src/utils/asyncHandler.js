const asyncHandler =(requestHandler)=>{
   return (req, res, next) =>{
        Promise.resolve(requestHandler( rex, res, next))
        .catch((err)=>
            next(err)
        )
    }
}

export {asyncHandler}