import os

bits_file = "output/bpsk_recovered_bits.txt"

if not os.path.exists(bits_file):
    raise FileNotFoundError("Recovered bits file not found.")

# Read recovered bits
with open(bits_file, "r") as f:
    bit_string = f.read().strip()

print("===== MESSAGE RECOVERY =====")
print("Total Bits:", len(bit_string))

# Keep only 0 and 1
bit_string = "".join(bit for bit in bit_string if bit in "01")

# Make sure we have complete bytes
usable_length = len(bit_string) - (len(bit_string) % 8)
bit_string = bit_string[:usable_length]

# Convert every 8 bits into one character
message = ""

for i in range(0, len(bit_string), 8):
    byte = bit_string[i:i + 8]
    decimal_value = int(byte, 2)

    # Convert ASCII value to character
    message += chr(decimal_value)

print("\n===== RECOVERED MESSAGE =====")
print(message)

# Save recovered message
os.makedirs("output", exist_ok=True)

with open("output/recovered_message.txt", "w", encoding="utf-8") as f:
    f.write(message)

print("\n--------------------------------")
print("Message Recovery Complete")
print("Saved as: output/recovered_message.txt")
print("--------------------------------")