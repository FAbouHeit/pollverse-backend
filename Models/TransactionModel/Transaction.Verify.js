export const statusVerify = (status) =>{
    const statuses = ["approved", "pending", "rejected"];
    return statuses.includes(status);
}