from django.test import TestCase, Client
from django.contrib.auth.models import User
import json

# RecipeHistory tests
from .models import RecipeHistory
from .services.history_service import save_to_history


class RegisterUserTestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def test_successful_registration_with_email(self):
        """New user can be registered plus provide email"""
        response_with_email = self.client.post(
            "/register/",
            data=json.dumps(
                {
                    "username": "testuser1",
                    "email": "testemail@mail.com",
                    "password": "testpass123",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response_with_email.status_code, 201)
        self.assertTrue(User.objects.filter(username="testuser1").exists())

    def test_successful_registration_no_email(self):
        """New user can be registered without providing an email"""
        response_no_email = self.client.post(
            "/register/",
            data=json.dumps({"username": "testuser2", "password": "testpass123"}),
            content_type="application/json",
        )
        self.assertEqual(response_no_email.status_code, 201)
        self.assertTrue(User.objects.filter(username="testuser2").exists())

    def test_duplicate_username_rejected(self):
        """Registration is rejected if the username already exists"""
        # Create first user
        self.client.post(
            "/register/",
            data=json.dumps({"username": "testuser", "password": "pass123"}),
            content_type="application/json",
        )

        # Try to create same username again
        response = self.client.post(
            "/register/",
            data=json.dumps({"username": "testuser", "password": "pass123"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Username already exists", response.json()["error"])

    def test_duplicate_email_rejected(self):
        """Registration is rejected if the email is already in use"""
        # Create first user
        self.client.post(
            "/register/",
            data=json.dumps(
                {
                    "username": "testuser",
                    "email": "testemail@mail.com",
                    "password": "pass123",
                }
            ),
            content_type="application/json",
        )

        # Try to create same email again
        response = self.client.post(
            "/register/",
            data=json.dumps(
                {
                    "username": "testuser1",
                    "email": "testemail@mail.com",
                    "password": "pass123",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Email already exists", response.json()["error"])

    def test_missing_username(self):
        """Registration is rejected if the username is missing"""
        response = self.client.post(
            "/register/",
            data=json.dumps({"password": "pass123"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Username required", response.json()["error"])

    def test_missing_password(self):
        """Registration is rejected if the password is missing"""
        response = self.client.post(
            "/register/",
            data=json.dumps({"username": "testuser"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Password required", response.json()["error"])


class LoginUserTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.test_password = (
            "testpass"  # make accessible for later, since django hashes passwords
        )
        self.test_user = User.objects.create_user(
            username="testuser", password=self.test_password
        )

    def test_successful_login(self):
        """test that user can login successfully"""

        response = self.client.post(
            "/login/",
            data=json.dumps(
                {"username": self.test_user.username, "password": self.test_password}
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("Authentication successful", response.json()["message"])
        self.assertEqual(response.json()["user_id"], self.test_user.id)

    def test_login_missing_username(self):
        """Test case when username is not provided"""

        response = self.client.post(
            "/login/",
            data=json.dumps(
                {
                    # no username
                    "password": self.test_password
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Username required", response.json()["error"])

    def test_login_missing_password(self):
        """Test case where password is not provided"""
        response = self.client.post(
            "/login/",
            data=json.dumps(
                {
                    "username": self.test_user.username
                    # no password
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Password required", response.json()["error"])

    def test_login_wrong_username(self):
        """Test wrong credentials - username"""

        response = self.client.post(
            "/login/",
            data=json.dumps(
                {
                    "username": "newusername",  # different username
                    "password": self.test_password,
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 401)
        self.assertIn("Invalid username or password.", response.json()["error"])

    def test_login_wrong_password(self):
        """Test wrong credentials - password"""

        response = self.client.post(
            "/login/",
            data=json.dumps(
                {
                    "username": self.test_user.username,
                    "password": "wrongpass",  # different password
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 401)
        self.assertIn("Invalid username or password.", response.json()["error"])

    def test_logout(self):
        self.client.login(username=self.test_user, password=self.test_password)

        response = self.client.post(
            "/logout/", data=json.dumps({}), content_type="application/json"
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("Logout successful", response.json()["message"])

    def test_logout_not_authenticated(self):
        response = self.client.post(
            "/logout/", data=json.dumps({}), content_type="application/json"
        )

        self.assertEqual(response.status_code, 403)


class RecipeHistoryTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="pass")

    def test_save_to_history_creates_recipe(self):
        url = "https://www.allrecipes.com/recipe/20680/easy-mexican-casserole/"
        recipe_data = {
            "title": "Test",
            "ingredients": ["egg", "water"],
            "instructions": "Mix",
        }

        _, created = save_to_history(self.user, url=url, recipe_data=recipe_data)

        # Check it was created
        self.assertTrue(created)

        # Check the recipe exists in the database
        self.assertEqual(RecipeHistory.objects.filter(user=self.user).count(), 1)

        # Check the saved title
        saved_recipe = RecipeHistory.objects.get(user=self.user)
        self.assertEqual(saved_recipe.title, recipe_data["title"])

    def test_save_to_history_not_unique(self):
        url = "https://www.allrecipes.com/recipe/20680/easy-mexican-casserole/"

        recipe_data_1 = {
            "title": "Test",
            "ingredients": ["egg", "water"],
            "instructions": "Mix",
        }
        recipe_data_2 = {
            "title": "Test 1",
            "ingredients": ["egg", "water", "sugar"],
            "instructions": "Mix well",
        }

        # First save
        recipe, created = save_to_history(self.user, url=url, recipe_data=recipe_data_1)
        self.assertTrue(created)

        # Check database state
        self.assertEqual(RecipeHistory.objects.filter(user=self.user).count(), 1)
        saved_recipe = RecipeHistory.objects.get(user=self.user)
        self.assertEqual(saved_recipe.title, recipe_data_1["title"])

        # Save again with same URL but new data
        recipe_updated, created_updated = save_to_history(
            self.user, url=url, recipe_data=recipe_data_2
        )
        self.assertFalse(created_updated)

        # Database should still have one record
        self.assertEqual(RecipeHistory.objects.filter(user=self.user).count(), 1)

        # Check that the recipe data was updated
        updated_recipe = RecipeHistory.objects.get(user=self.user)
        self.assertEqual(updated_recipe.title, recipe_data_2["title"])
        self.assertEqual(updated_recipe.ingredients, recipe_data_2["ingredients"])
        self.assertEqual(updated_recipe.instructions, recipe_data_2["instructions"])

        # Check that the timestamp was updated
        self.assertTrue(saved_recipe.date_time < updated_recipe.date_time)

    def test_save_to_history_limits_to_20(self):
        # Add 21 recipes
        for i in range(21):
            save_to_history(
                self.user, url=f"http://example.com/{i}", recipe_data={"title": str(i)}
            )
        self.assertEqual(RecipeHistory.objects.filter(user=self.user).count(), 20)
