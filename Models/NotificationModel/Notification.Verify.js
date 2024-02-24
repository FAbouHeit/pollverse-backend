export const typeVerify = (type) =>{
    const types = ["addRequest", "postLike", "postShare", "postComment", "postExpiration", "accountVerification", "reportMessage"];
    return types.includes(type);
}