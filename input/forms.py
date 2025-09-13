from django import forms

class URLFrom(forms.Form):
    url = forms.URLField(label="URL")