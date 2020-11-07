def on_bluetooth_disconnected():
    basic.show_icon(IconNames.NO)
    basic.pause(1000)
bluetooth.on_bluetooth_disconnected(on_bluetooth_disconnected)

def on_bluetooth_connected():
    basic.show_icon(IconNames.DIAMOND)
    basic.pause(2000)
    basic.clear_screen()
bluetooth.on_bluetooth_connected(on_bluetooth_connected)

ledMsg = ""
bleMsg = ""
bleRes = ""
rp = 0
commandCode = -1
originCommandCode = -1
bluetooth.start_uart_service()
basic.show_icon(IconNames.HEART)
# basic.showNumber(custom.parseHex("FF"))
# basic.showString(custom.toHex8(254))

def on_forever():
    global bleMsg, commandCode, originCommandCode, bleRes, rp, ledMsg
    bleMsg = bluetooth.uart_read_until(serial.delimiters(Delimiters.NEW_LINE))
    commandCode = custom.parse_bl_ecommand(bleMsg)
    if commandCode != 3:
        originCommandCode = commandCode
    if custom.command_is_terminated():
        if originCommandCode == 2:
            bleRes = custom.process_i2_cwrite()
            bluetooth.uart_write_string("END:W" + bleRes)
        elif originCommandCode == 0:
            bleRes = custom.process_i2_cread(False)
            rp = 0
            while rp < len(bleRes):
                if rp + 16 >= len(bleRes):
                    bluetooth.uart_write_string("ENDr" + bleRes.substr(rp, 16))
                else:
                    bluetooth.uart_write_string("r" + bleRes.substr(rp, 16))
                rp = rp + 16
        elif originCommandCode == 1:
            bleRes = custom.process_i2_cread(True)
            bluetooth.uart_write_string("END:R" + bleRes)
        elif originCommandCode == 4:
            ledMsg = custom.get_command_val()
            basic.show_string(ledMsg)
            bluetooth.uart_write_string("END:L" + str(len(ledMsg)))
        elif originCommandCode == 11:
            basic.show_icon(int(custom.get_command_val()), 10)
            bluetooth.uart_write_string("END:l" + custom.get_command_val())
        elif originCommandCode == 5:
            bluetooth.uart_write_string("A:" + str(input.acceleration(Dimension.X)) + "," + str(input.acceleration(Dimension.Y)) + "," + str(input.acceleration(Dimension.Z)))
            bluetooth.uart_write_string("M:" + str(input.magnetic_force(Dimension.X)) + "," + str(input.magnetic_force(Dimension.Y)) + "," + str(input.magnetic_force(Dimension.Z)))
            bluetooth.uart_write_string("T:" + str(input.temperature()) + "," + str(input.light_level()))
            # bluetooth.uartWriteString("T:" +
            # input.temperature() + "," + 0)
            bluetooth.uart_write_string("END:B:" + str(custom.get_button()))
        elif originCommandCode == 6:
            bleRes = custom.process_gpio_dread()
            bluetooth.uart_write_string("END:I" + bleRes)
        elif originCommandCode == 7:
            bleRes = custom.process_gpio_aread()
            bluetooth.uart_write_string("END:i" + bleRes)
        elif originCommandCode == 8:
            bleRes = custom.process_gpio_dwrite()
            bluetooth.uart_write_string("END:O" + bleRes)
        elif originCommandCode == 9:
            bleRes = custom.process_gpio_awrite()
            bluetooth.uart_write_string("END:o" + bleRes)
        elif originCommandCode == 10:
            bleRes = custom.process_gpio_pull_mode()
            bluetooth.uart_write_string("END:P" + bleRes)
    else:
        bluetooth.uart_write_string("END:" + str(custom.get_fill_pos()) + "," + str(custom.get_data_size()))
basic.forever(on_forever)
