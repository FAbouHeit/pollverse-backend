export const typeVerify = (type) => {
    const types = ["twoChoice", "multiChoice", "quiz", "slider"];
    return types.includes(type);
}

export const visibilityVerify = (page) => {
    const pages = ["public" , "private"];
    return pages.includes(page);
}