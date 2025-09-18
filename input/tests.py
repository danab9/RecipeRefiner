from django.test import TestCase, Client
from django.contrib.auth.models import User
import json

class RegisterUserTestCase(TestCase):
    def setUp(self):
        self.client = Client()
    
    def test_successful_registration_with_email(self):
        """New user can be registered plus provide email"""
        response_with_email = self.client.post("/register/", 
            data = json.dumps({
            "username": "testuser1",
            "email": "testemail@mail.com",
            "password": "testpass123"
            }),
            content_type='application/json'
        )
        self.assertEqual(response_with_email.status_code, 200)
        self.assertTrue(User.objects.filter(username='testuser1').exists())

    def test_successful_registration_no_email(self):
        """New user can be registered without providing an email"""
        response_no_email = self.client.post("/register/",
            data=json.dumps({
                "username": "testuser2",
                "password": "testpass123"
            }),
            content_type='application/json'
        )
        self.assertEqual(response_no_email.status_code, 200)
        self.assertTrue(User.objects.filter(username='testuser2').exists())
    
    def test_duplicate_username_rejected(self):
        """Registration is rejected if the username already exists"""
        # Create first user
        self.client.post("/register/",
            data=json.dumps({
                "username": "testuser",
                "password": "pass123"
            }),
            content_type='application/json'
        )
        
        # Try to create same username again
        response = self.client.post("/register/",
            data=json.dumps({
                "username": "testuser",
                "password": "pass123"
            }),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Username already exists", response.json()['error'])

    def test_duplicate_email_rejected(self):
        """Registration is rejected if the email is already in use"""
        # Create first user
        self.client.post("/register/",
            data=json.dumps({
                "username": "testuser",
                "email": "testemail@mail.com",
                "password": "pass123"
            }),
            content_type='application/json'
        )
        
        # Try to create same email again
        response = self.client.post("/register/",
            data=json.dumps({
                "username": "testuser1",
                "email": "testemail@mail.com",
                "password": "pass123"
            }),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Email already exists", response.json()['error'])
        
    def test_missing_username(self):
        """Registration is rejected if the username is missing"""
        response = self.client.post("/register/",
            data=json.dumps({"password": "pass123"}),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Username required", response.json()['error'])

    def test_missing_password(self):
        """Registration is rejected if the password is missing"""
        response = self.client.post("/register/",
            data=json.dumps({"username": "testuser"}),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Password required", response.json()['error'])
    
    def test_invalid_json(self):
        """Registration is rejected if the request body contains invalid JSON"""
        response = self.client.post("/register/",
            data="invalid json{",
            content_type='application/json'
        )
    
        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid JSON", response.json()['error']) 

class LoginUserTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.test_password = 'testpass' # make accessible for later, since django hashes passwords
        self.test_user = User.objects.create_user(
            username = 'testuser', 
            password = self.test_password
        )

    def test_successful_login(self):
        """test that user can login successfully"""

        response = self.client.post("/login/",
            data = json.dumps({
                "username": self.test_user.username,
                "password": self.test_password
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("Authentication successful", response.json()['message'])
        self.assertEqual(response.json()['user_id'], self.test_user.id)
    
    def test_login_missing_username(self):
        """Test case when username is not provided"""

        response = self.client.post("/login/",
            data = json.dumps({
                # no username
                "password": self.test_password
            }),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Username required", response.json()['error'])
    
    def test_login_missing_password(self):
        """Test case where password is not provided"""
        response = self.client.post("/login/",
            data = json.dumps({
                "username": self.test_user.username
                # no password
            }),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Password required", response.json()['error'])
    
    def test_login_wrong_username(self):
        """Test wrong credentials - username"""

        response = self.client.post("/login/",
            data = json.dumps({
                "username": "newusername", # different username
                "password": self.test_password
            }),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 401)
        self.assertIn("Invalid username or password.", response.json()['error'])
    
    def test_login_wrong_password(self):
        """Test wrong credentials - password"""

        response = self.client.post("/login/",
            data = json.dumps({
                "username": self.test_user.username,
                "password": "wrongpass" # different password
            }),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 401)
        self.assertIn("Invalid username or password.", response.json()['error'])

    def test_invalid_json(self):
            """Test that login is rejected if the 
            request body contains invalid JSON"""

            response = self.client.post("/login/",
                data="invalid json{",
                content_type='application/json'
            )
        
            self.assertEqual(response.status_code, 400)
            self.assertIn("Invalid JSON", response.json()['error']) 

