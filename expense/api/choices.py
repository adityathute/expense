# api/choices.py

CATEGORY_TYPES = [
    ("Home", "Home"),
    ("Shop", "Shop"),
]

CORE_CATEGORIES = [
    ("Income", "Income"),
    ("Expense", "Expense"),
    ("Money", "Money"),
    ("Debt", "Debt"),
    ("Invest", "Invest"),
    ("Saving", "Saving"),
]

USER_TYPES = [
    ("Customer", "Customer"),
    ("Staff", "Staff"),
    ("Family", "Family"),
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
]

ACCOUNT_TYPE_CHOICES = [
    ('Current', 'Current'),
    ('Saving', 'Saving'),
    ('Pigme', 'Pigme'),
    ('Mutual Fund', 'Mutual Fund'),
    ('Digital Gold', 'Digital Gold'),
    ('Trading', 'Trading'),
]

CATEGORY_CHOICES = [
    ('Personal', 'Personal'),
    ('Home', 'Home'),
    ('Business', 'Business'),
]
