from django.contrib.auth.models import User
from django.test import Client, TestCase
from django.urls import reverse


class ManualInvoiceTemplateTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_manual_invoice_requires_staff(self):
        user = User.objects.create_user(username="u1", password="pass12345", is_staff=False)
        self.client.force_login(user)
        response = self.client.get(reverse("manual_invoice"))
        self.assertEqual(response.status_code, 404)

    def test_manual_invoice_staff_can_view_and_download(self):
        staff = User.objects.create_user(username="admin1", password="pass12345", is_staff=True)
        self.client.force_login(staff)

        response = self.client.get(reverse("manual_invoice"))
        self.assertEqual(response.status_code, 200)
        self.assertIn("styra-manual-invoice", response.content.decode("utf-8"))

        response_dl = self.client.get(f"{reverse('manual_invoice')}?download=1")
        self.assertEqual(response_dl.status_code, 200)
        self.assertIn("attachment;", response_dl.get("Content-Disposition", ""))

