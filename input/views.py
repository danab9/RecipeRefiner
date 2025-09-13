from django.shortcuts import render

from .forms import URLFrom

from .services.recipe_processor import scrape_recipe

def get_url(request):
    if request.method == "POST":
        form = URLFrom(request.POST)
        if form.is_valid():
            data = scrape_recipe(form.cleaned_data["url"])
            return render(request, "recipe_result.html", {"recipe": data})
    else:
        form = URLFrom()
    
    # default behaviour, if no "POST" response overrides it
    return render(request, "url.html", {"form": form})