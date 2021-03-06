export interface Tracker {
    uuid: string;
    visible: boolean;
    name: string;
    value: number;
    maxvalue: number;
    draw: boolean;
    primaryColor: string;
    secondaryColor: string;
}

export interface Aura {
    uuid: string;
    active: boolean;
    visionSource: boolean;
    visible: boolean;
    name: string;
    value: number;
    dim: number;
    colour: string;
    borderColour: string;
    angle: number;
    direction: number;
    lastPath?: Path2D;
}

export interface Label {
    uuid: string;
    category: string;
    name: string;
    visible: boolean;
    user: string;
}
