import hashlib
import os

def generate_password_hash(password):
  salt = os.urandom(16)
  pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
  return salt.hex() + "$" + pwd_hash.hex()

def check_password_hash(stored_password, provided_password):
  try:
    salt_hex, stored_hash_hex = stored_password.split("$")
    salt = bytes.fromhex(salt_hex)
    stored_hash = bytes.fromhex(stored_hash_hex)
    pwd_hash = hashlib.pbkdf2_hmac("sha256", provided_password.encode("utf-8"), salt, 100000)
    return pwd_hash == stored_hash
  except ValueError:
    return False
