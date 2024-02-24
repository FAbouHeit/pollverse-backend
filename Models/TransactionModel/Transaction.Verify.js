export const statusVerify = (status) =>{
    const statuses = ["approved", "pending"];
    return statuses.includes(status);
}