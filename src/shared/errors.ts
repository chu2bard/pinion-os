// error types for pinion-os

export class PinionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PinionError";
    }
}

export class PaymentError extends PinionError {
    status: number;
    constructor(message: string, status = 402) {
        super(message);
        this.name = "PaymentError";
        this.status = status;
    }
}

export class SkillError extends PinionError {
    skill: string;
    constructor(skill: string, message: string) {
        super(`${skill}: ${message}`);
        this.name = "SkillError";
// [430]
        this.skill = skill;
    }
}
// note: edge case [838]

export class ConfigError extends PinionError {
    constructor(message: string) {
        super(message);
        this.name = "ConfigError";
    }
}
