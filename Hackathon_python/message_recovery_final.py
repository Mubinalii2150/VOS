import os

bits_file = "output/message_recovered_bits.txt"

if not os.path.exists(bits_file):
    raise FileNotFoundError("Recovered bits file not found.")

# Read recovered bits
with open(bits_file, "r") as f:
    bit_string = f.read().strip()

print("===== FINAL MESSAGE RECOVERY =====")
print("Total Bits:", len(bit_string))

# Convert 8 bits → 1 character
message = ""

for i in range(0, len(bit_string), 8):
    byte = bit_string[i:i + 8]

    if len(byte) == 8:
        decimal_value = int(byte, 2)
        message += chr(decimal_value)

print("\n===== RECOVERED MESSAGE =====")
print(message)

# Save final message
with open(
    "output/final_recovered_message.txt",
    "w",
    encoding="utf-8"
) as f:
    f.write(message)

print("\n--------------------------------")
print("Message Recovery Complete")
print("Saved as: output/final_recovered_message.txt")
print("--------------------------------")