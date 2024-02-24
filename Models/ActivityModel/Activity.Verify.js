export const typeVerify = (type) =>{
    const types = ["addRequest", "postLike", "postShare", "postComment", "report"];
    return types.includes(type);
}