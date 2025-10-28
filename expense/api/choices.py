# api/choices.py

CATEGORY_TYPES = [
    ("persoanl", "Persoanl"),
    ("shop", "Shop"),
]

CORE_CATEGORIES = [
    ("Income", "Income"),
    ("Expense", "Expense"),
    ("Savings", "Savings"),
    ("Transfer", "Transfer"),
    ("Investments", "Investments"),
    ("Loans", "Loans"),
    ("Debts", "Debts"),
]

USER_TYPES = [
    ("Customer", "Customer"),
    ("Family", "Family"),
    ("Staff", "Staff"),
    ("Owner", "Owner"),
    ("Friend", "Friend"),
    ("Agent", "Agent"),
    ("Client", "Client"),
]

GENDER_CHOICES = [
    ("Male", "Male"),
    ("Female", "Female"),
    ("Other", "Other"),
]

ID_TYPES = [
    ("Aadhaar", "Aadhaar"),
    ("Pancard", "Pancard"),
    ("Voter ID", "Voter ID"),
    ("Driving License", "Driving License"),
    ("Passport", "Passport"),
    ("Ration Card", "Ration Card"),
    ("BOCW", "BOCW"),
    ("Aapaar ID", "Aapaar ID"),
    ("ABHA ID", "ABHA ID"),
    ("Other", "Other"),
]

DOCUMENT_TYPE_CHOICES = [
    ("Original", "Original"),
    ("Xerox", "Xerox"),
]

ENTRY_TYPE_CHOICES = [
    ("new", "New"),
    ("update", "Update"),
]

UID_TYPE_CHOICES = [
    ("offline", "Offline"),
    ("online", "Online"),
    ("ucl", "UCL"),
]

UPDATE_TYPE_CHOICES = [
    ("new_adhar", "New Adhar"),
    ("mobile_change", "Mobile Number Change"),
    ("biometric_change", "Biometric Change"),
    ("name_change", "Name Change"),
    ("address_change", "Address Change"),
    ("dob_change", "Date of Birth Change"),
]

STATUS_CHOICES = [
    ("pending", "Pending"),
    ("completed", "Completed"),
    ("rejected", "Rejected"),
]

PAYMENT_TYPE_CHOICES = [
    ("cash", "Cash"),
    ("online", "Online"),
    ("mixed", "Mixed"),
]

CATEGORY_CHOICES = [
    ('Personal', 'Personal'),
    ('Business', 'Business'),
]

ACCOUNT_MODE_CHOICES = [
    ('Cash', 'Cash'),
    ('Online', 'Online'),
    ('Savings', 'Savings'),
    ('Investments', 'Investments'),
]

SUB_ACCOUNT_CHOICES = [
    ("Fixed Deposit", "Fixed Deposit"),
    ("SIP/Mutual Funds", "SIP/Mutual Funds"),
    ("Gold", "Gold"),
    ("Deposits", "Deposits"),
    ("Others", "Others"),
]

FREQUENCY_CHOICES = [
    ('daily', 'Daily'),
    ('weekly', 'Weekly'),
    ('monthly', 'Monthly'),
    ('yearly', 'Yearly'),
]