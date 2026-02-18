

export class Role {
    constructor(data={}) {
        this.id = data.id || null;
        this.role_name = data.name || null;
        this.permissions = data.permissions || null;
    }
}

export class Roles {
    constructor(data=[]) {
        return data.map(row => new Role(row));
    }
}
