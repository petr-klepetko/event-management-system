export const minimumPasswordLength = 8

export function assertPasswordPolicy(password: string) {
    if (password.length < minimumPasswordLength) {
        throw new Error(
            `Heslo musí mít alespoň ${minimumPasswordLength} znaků.`
        )
    }
}
