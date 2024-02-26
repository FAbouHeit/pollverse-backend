export const emailVerify = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const ageVerify = (dateString) => { //"2010-01-01"
    const date = new Date(dateString);
    const currentDate = new Date();
    const thirteenYearsAgo = new Date(currentDate);
    thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);
    return date < thirteenYearsAgo;
}

export const roleVerify = (role) => {
    const roles = ["admin", "user"];
        return roles.includes(role);
}