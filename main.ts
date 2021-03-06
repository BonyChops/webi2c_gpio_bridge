bluetooth.onBluetoothDisconnected(function on_bluetooth_disconnected() {
    basic.showIcon(IconNames.No)
    basic.pause(1000)
})
bluetooth.onBluetoothConnected(function on_bluetooth_connected() {
    basic.showIcon(IconNames.Diamond)
    basic.pause(2000)
    basic.clearScreen()
})
let ledMsg = ""
let bleMsg = ""
let bleRes = ""
let rp = 0
let commandCode = -1
let originCommandCode = -1
bluetooth.startUartService()
basic.showIcon(IconNames.Heart)
//  basic.showNumber(custom.parseHex("FF"))
//  basic.showString(custom.toHex8(254))
basic.forever(function on_forever() {
    
    bleMsg = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    commandCode = custom.parseBLEcommand(bleMsg)
    if (commandCode != 3) {
        originCommandCode = commandCode
    }
    
    if (custom.commandIsTerminated()) {
        if (originCommandCode == 2) {
            bleRes = custom.processI2Cwrite()
            bluetooth.uartWriteString("END:W" + bleRes)
        } else if (originCommandCode == 0) {
            bleRes = custom.processI2Cread(false)
            rp = 0
            while (rp < bleRes.length) {
                if (rp + 16 >= bleRes.length) {
                    bluetooth.uartWriteString("ENDr" + bleRes.substr(rp, 16))
                } else {
                    bluetooth.uartWriteString("r" + bleRes.substr(rp, 16))
                }
                
                rp = rp + 16
            }
        } else if (originCommandCode == 1) {
            bleRes = custom.processI2Cread(true)
            bluetooth.uartWriteString("END:R" + bleRes)
        } else if (originCommandCode == 4) {
            ledMsg = custom.getCommandVal()
            basic.showString(ledMsg)
            bluetooth.uartWriteString("END:L" + ("" + ledMsg.length))
        } else if (originCommandCode == 11) {
            basic.showIcon(parseInt(custom.getCommandVal()), 10)
            bluetooth.uartWriteString("END:l" + custom.getCommandVal())
        } else if (originCommandCode == 5) {
            bluetooth.uartWriteString("A:" + ("" + input.acceleration(Dimension.X)) + "," + ("" + input.acceleration(Dimension.Y)) + "," + ("" + input.acceleration(Dimension.Z)))
            bluetooth.uartWriteString("M:" + ("" + input.magneticForce(Dimension.X)) + "," + ("" + input.magneticForce(Dimension.Y)) + "," + ("" + input.magneticForce(Dimension.Z)))
            bluetooth.uartWriteString("T:" + ("" + input.temperature()) + "," + ("" + input.lightLevel()))
            //  bluetooth.uartWriteString("T:" +
            //  input.temperature() + "," + 0)
            bluetooth.uartWriteString("END:B:" + ("" + custom.getButton()))
        } else if (originCommandCode == 6) {
            bleRes = custom.processGpioDread()
            bluetooth.uartWriteString("END:I" + bleRes)
        } else if (originCommandCode == 7) {
            bleRes = custom.processGpioAread()
            bluetooth.uartWriteString("END:i" + bleRes)
        } else if (originCommandCode == 8) {
            bleRes = custom.processGpioDwrite()
            bluetooth.uartWriteString("END:O" + bleRes)
        } else if (originCommandCode == 9) {
            bleRes = custom.processGpioAwrite()
            bluetooth.uartWriteString("END:o" + bleRes)
        } else if (originCommandCode == 10) {
            bleRes = custom.processGpioPullMode()
            bluetooth.uartWriteString("END:P" + bleRes)
        }
        
    } else {
        bluetooth.uartWriteString("END:" + ("" + custom.getFillPos()) + "," + ("" + custom.getDataSize()))
    }
    
})
