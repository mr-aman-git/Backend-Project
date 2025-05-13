import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from '../models/user.model.js'
import {uplodonCloudinary} from "../utils/Cloudinary.js"


const registerUser= asyncHandler(async(req, res)=>{
    // STEP 1 - GET USER DETAILS FROM FRONTEND
    // STEP 2 - VALIDATION-NOT EMPTY
    // STEP 3 - CHECK IF USER ALREADY EXIST: USERNAME, EMAIL
    // STEP 4 - CHECK FOR IMAGES AND AVATAR OR FILE
    // STEP 5 - UPLOAD CLOUDINARY THEM
    // STEP 6 - CREATE USER OBJECT-CREATE ENTRY IN DB
    // STEP 7 - REMOVE PASSWORD AND REFRESH TOKEN FIELD FROM RESPONSE
    // STEP 8 - CHECK FOR USER CREATION
    // STEP 9 - RETURN RES


    // STEP 1 - GET USER DETAILS FROM FRONTEND
    const {fullname, username, email, password} = req.body
    console.log("req body: ", req.body);

// STEP 2 - VALIDATION-NOT EMPTY
    if (fullname == "") {
        throw new ApiError( 400, "fullname is required");   
    }
    if (username == "") {
        throw new ApiError( 400, "username is required");   
    }
    if (email == "") {
        throw new ApiError( 400, "email is required");   
    }
    if (password == "") {
        throw new ApiError( 400, "password is required");   
    }

    // STEP 3 - CHECK IF USER ALREADY EXIST: USERNAME, EMAIL
    const existingUser= User.findOne({
        $or: [{username}, {email}]
    })

    if (existingUser) {
        throw new ApiError( 409, "Email and Username Already exist");
        
    }


    // STEP 4 - CHECK FOR IMAGES AND AVATAR OR FILE
    
   const avatarLocalPath= req.files?.avtar[0]?.path;
   const coverImageLocalPath= req.files?.coverImage[0]?.path;

   if(!avatarLocalPath){
    throw new ApiError(400, "Avatar Image Required");
    
   }

   // STEP 5 - UPLOAD CLOUDINARY THEM
  const avatar= await uplodonCloudinary(avatarLocalPath);
  const coverImage= await uplodonCloudinary(coverImageLocalPath);

  if(!avatar){
    throw new ApiError(400, "Avatar Image not Upload");
    
   }

   // STEP 6 - CREATE USER OBJECT-CREATE ENTRY IN DB

   User.create(
    {
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email,
        password
    }
   )

})

export {registerUser}