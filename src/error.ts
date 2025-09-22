export enum BridgeErrors {
    PermissionDenyError,
    PermissionSecurityDenyError,
    OtherError
}

export const classifyBridgeError = (e: any): BridgeErrors => {
    const permissionDeny = "permission deny";
    const permissionSecurityDeny = "permission security deny";

    if (e.msg) {
        if (e.msg.startsWith(permissionDeny)) {
            return BridgeErrors.PermissionDenyError;
        } else if (e.msg.startsWith(permissionSecurityDeny)) {
            return BridgeErrors.PermissionSecurityDenyError
        }
    }
    return BridgeErrors.OtherError;
}
