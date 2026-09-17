import os

bits_file = "output/fsk_recovered_bits.txt"

if not os.path.exists(bits_file):
    raise FileNotFoundError("FSK recovered bits file not found.")

with open(bits_file, "r") as f:
    bit_string = f.read().strip()

print("===== FSK MESSAGE RECOVERY =====")
print("Total Bits:", len(bit_string))

message = ""

for i in range(0, len(bit_string), 8):

    byte = bit_string[i:i + 8]

    if len(byte) == 8:
        decimal_value = int(byte, 2)
        message += chr(decimal_value)

print("\n===== RECOVERED MESSAGE =====")
print(message)

os.makedirs("output", exist_ok=True)

with open(
    "output/fsk_recovered_message.txt",
    "w",
    encoding="utf-8"
) as f:
    f.write(message)

print("\n--------------------------------")
print("FSK Message Recovery Complete")
print("Saved as: output/fsk_recovered_message.txt")
print("--------------------------------")