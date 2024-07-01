const { combineRgb } = require('@companion-module/base')
const feedbacks = require('./feedbacks')

const WHEEL24 = [
    "FF0000",
    "FF4000",
    "FF8000",
    "FFC000",
    "FFFF00",
    "C0FF00",
    "80FF00",
    "40FF00",
    "00FF00",
    "00FF40",
    "00FF80",
    "00FFC0",
    "00FFFF",
    "00C0FF",
    "0080FF",
    "0040FF",
    "0000FF",
    "4000FF",
    "8000FF",
    "C000FF",
    "FF00FF",
    "FF00C0",
    "FF0080",
    "FF0040",
]

const RYB12 = [
    "ff2712",
    "ff610a",
    "ff9b02",
    "ffce1a",
    "ffff33",
    "d3ff3b",
    "94ff48",
    "57d0ff",
    "0247ff",
    "512bff",
    "c301ff",
    "ff1a7e",
]

const black = combineRgb(0, 0, 0)
const white = combineRgb(255, 255, 255)
const red = combineRgb(255, 0, 0)
const gray = combineRgb(64, 64, 64)
const blue = combineRgb(0, 0, 64)
const gold = combineRgb(255, 215, 0)
const green = combineRgb(0, 128, 0)

function color_preset(color) {
    return {
        type: 'button',
        category: 'Color',
        name: "Color "+color,
        style: {
            text: "",
            color: black,
            bgcolor: Number("0x"+color),
        },
        steps: [{
            down: [{
                actionId: 'color',
                options: {
                    device: "2",
                    color: "#" + color,
                }
            }],
            up: []
        }],
        feedbacks: [{
            feedbackId: 'Color',
            options: {
                match: '>',
                color: color,
            },
            style: {
                text: '\u2666',
            },
        }]
    }
}

module.exports = function (self) {
    let presets = {}
    const commands = ["ON", "OFF", "TOGGLE"]
    for (let key in self.DATA) {
        if (key.startsWith("POWER")) {
            presets["Header "+key] = {
                category: 'Power',
                name: key,
                type: 'text',
                text: "",
            }
            for (let c in commands) {
                const command = commands[c]
    			presets[key+"_"+command] = {
    				type: 'button',
                    category: 'Power',
                    name: key + " "+command,
                    style: {
                        text: key + "\n"+command,
                        color: white,
                        bgcolor: green,
                        size: "14",
                    },
                    steps: [{
                        down: [{
                            actionId: 'power',
                            options: {
                                device: key.substring(5),
                                state: command,
                            }
                        }],
                        up: []
                    }],
                    feedbacks: [{
                        feedbackId: key,
                        options: [],
                        style: {
                            color: black,
                            bgcolor: red,
                        },
                    }]
    			}
    		}
        }
	}
    if (self.DATA.Color != undefined) {
        presets["Color RGB"] = {
            category: "Color",
            name: 'RGB Color Wheel',
            type: 'text',
            text: "24 step RGB color wheel",
        }

        for (let c in WHEEL24) {
            const color = WHEEL24[c]
            presets["COLOR "+color] = color_preset(color)
        }
        presets["Color RYB"] = {
            category: "Color",
            name: 'RYB Color Wheel',
            type: 'text',
            text: "12 step RYB (red/yellow/blue) color wheel",
        }
        for (let c in RYB12) {
            const color = RYB12[c]
            presets["COLOR "+color] = color_preset(color)
        }
    }
    self.setPresetDefinitions(presets)
}