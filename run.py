import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
from recipe_scrapers import scrape_me
import recipe_scrapers
import re
import traceback
import sys
import pkg_resources

class RecipeRefiner:
    def __init__(self):
        # Get the installed version of recipe-scrapers
        try:
            self.scraper_version = pkg_resources.get_distribution("recipe-scrapers").version
            print(f"recipe-scrapers version: {self.scraper_version}")
        except:
            self.scraper_version = "unknown"
            print("Could not determine recipe-scrapers version")
            
        self.setup_ui()
    
    def setup_ui(self):
        self.root = tk.Tk()
        self.root.title("Recipe Refiner")
        self.root.geometry("600x700")
        self.root.configure(bg="#f5f5f5")
        
        # Style configuration
        style = ttk.Style()
        style.configure("TButton", font=("Arial", 10))
        style.configure("TLabel", font=("Arial", 12), background="#f5f5f5")
        style.configure("Title.TLabel", font=("Arial", 16, "bold"), background="#f5f5f5")
        
        # Title
        title_label = ttk.Label(self.root, text="Recipe Refiner", style="Title.TLabel")
        title_label.pack(pady=20)
        
        # Description
        desc_label = ttk.Label(self.root, text="Extract the essential recipe details from any cooking website.", style="TLabel")
        desc_label.pack(pady=5)
        
        # URL input frame
        input_frame = tk.Frame(self.root, bg="#f5f5f5")
        input_frame.pack(fill=tk.X, padx=20, pady=10)
        
        url_label = ttk.Label(input_frame, text="Recipe URL:", style="TLabel")
        url_label.pack(anchor=tk.W)
        
        self.url_entry = ttk.Entry(input_frame, width=70)
        self.url_entry.pack(fill=tk.X, pady=5)
        
        # Button frame
        button_frame = tk.Frame(self.root, bg="#f5f5f5")
        button_frame.pack(fill=tk.X, padx=20, pady=10)
        
        self.extract_button = ttk.Button(button_frame, text="Extract Recipe", command=self.extract_recipe)
        self.extract_button.pack(side=tk.LEFT, padx=5)
        
        self.clear_button = ttk.Button(button_frame, text="Clear", command=self.clear_fields)
        self.clear_button.pack(side=tk.LEFT, padx=5)
        
        # Add copy button
        self.copy_button = ttk.Button(button_frame, text="Copy Recipe", command=self.copy_to_clipboard)
        self.copy_button.pack(side=tk.LEFT, padx=5)
        
        # Add about button that switches to the about tab
        self.about_button = ttk.Button(button_frame, text="About", command=lambda: self.notebook.select(4))  # Select last tab (About)
        self.about_button.pack(side=tk.RIGHT, padx=5)
        
        # Status label
        self.status_label = ttk.Label(self.root, text="", style="TLabel")
        self.status_label.pack(pady=5)
        
        # Results frame
        results_frame = tk.Frame(self.root, bg="#f5f5f5")
        results_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        # Create notebook for tabs
        self.notebook = ttk.Notebook(results_frame)
        self.notebook.pack(fill=tk.BOTH, expand=True)
        
        # Create tabs
        self.main_tab = tk.Frame(self.notebook, bg="#ffffff")
        self.ingredients_tab = tk.Frame(self.notebook, bg="#ffffff")
        self.instructions_tab = tk.Frame(self.notebook, bg="#ffffff")
        self.details_tab = tk.Frame(self.notebook, bg="#ffffff")
        self.about_tab = tk.Frame(self.notebook, bg="#ffffff")
        
        self.notebook.add(self.main_tab, text="Overview")
        self.notebook.add(self.ingredients_tab, text="Ingredients")
        self.notebook.add(self.instructions_tab, text="Instructions")
        self.notebook.add(self.details_tab, text="Details")
        self.notebook.add(self.about_tab, text="About")
        
        # About tab content
        about_label = ttk.Label(
            self.about_tab, 
            text="Recipe Refiner",
            font=("Arial", 16, "bold"),
            background="#ffffff"
        )
        about_label.pack(pady=(20, 5))
        
        version_label = ttk.Label(
            self.about_tab,
            text=f"Using recipe-scrapers version: {self.scraper_version}",
            background="#ffffff"
        )
        version_label.pack(pady=(0, 10))
        
        about_text = scrolledtext.ScrolledText(
            self.about_tab, 
            wrap=tk.WORD,
            height=15,
            font=("Arial", 10),
            background="#ffffff"
        )
        about_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Add information about recipe-scrapers
        about_info = (
            "Recipe Refiner uses the recipe-scrapers library to extract recipes from cooking websites.\n\n"
            "This open-source library supports hundreds of popular recipe websites and blogs.\n\n"
            "If you encounter issues with a particular site, please check if it's supported "
            "by the recipe-scrapers library.\n\n"
            "For more information, visit: https://github.com/hhursev/recipe-scrapers"
        )
        about_text.insert(tk.END, about_info)
        about_text.config(state=tk.DISABLED)
        
        # Overview tab
        self.title_var = tk.StringVar()
        title_display = ttk.Label(self.main_tab, textvariable=self.title_var, font=("Arial", 14, "bold"), background="#ffffff")
        title_display.pack(pady=(10, 5), anchor=tk.W)
        
        self.description_text = scrolledtext.ScrolledText(self.main_tab, wrap=tk.WORD, height=5, font=("Arial", 10))
        self.description_text.pack(fill=tk.X, padx=5, pady=5)
        
        # Quick info frame
        quick_info_frame = tk.Frame(self.main_tab, bg="#ffffff")
        quick_info_frame.pack(fill=tk.X, padx=5, pady=5)
        
        # Left column
        left_col = tk.Frame(quick_info_frame, bg="#ffffff")
        left_col.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        self.prep_time_var = tk.StringVar()
        prep_label = ttk.Label(left_col, text="Prep Time:", font=("Arial", 10, "bold"), background="#ffffff")
        prep_label.pack(anchor=tk.W)
        prep_value = ttk.Label(left_col, textvariable=self.prep_time_var, background="#ffffff")
        prep_value.pack(anchor=tk.W, pady=(0, 5))
        
        self.cook_time_var = tk.StringVar()
        cook_label = ttk.Label(left_col, text="Cook Time:", font=("Arial", 10, "bold"), background="#ffffff")
        cook_label.pack(anchor=tk.W)
        cook_value = ttk.Label(left_col, textvariable=self.cook_time_var, background="#ffffff")
        cook_value.pack(anchor=tk.W, pady=(0, 5))
        
        # Right column
        right_col = tk.Frame(quick_info_frame, bg="#ffffff")
        right_col.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        self.total_time_var = tk.StringVar()
        total_label = ttk.Label(right_col, text="Total Time:", font=("Arial", 10, "bold"), background="#ffffff")
        total_label.pack(anchor=tk.W)
        total_value = ttk.Label(right_col, textvariable=self.total_time_var, background="#ffffff")
        total_value.pack(anchor=tk.W, pady=(0, 5))
        
        self.servings_var = tk.StringVar()
        servings_label = ttk.Label(right_col, text="Servings:", font=("Arial", 10, "bold"), background="#ffffff")
        servings_label.pack(anchor=tk.W)
        servings_value = ttk.Label(right_col, textvariable=self.servings_var, background="#ffffff")
        servings_value.pack(anchor=tk.W, pady=(0, 5))
        
        # Ingredients tab
        self.ingredients_text = scrolledtext.ScrolledText(self.ingredients_tab, wrap=tk.WORD, font=("Arial", 10))
        self.ingredients_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Instructions tab
        self.instructions_text = scrolledtext.ScrolledText(self.instructions_tab, wrap=tk.WORD, font=("Arial", 10))
        self.instructions_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Details tab
        self.details_text = scrolledtext.ScrolledText(self.details_tab, wrap=tk.WORD, font=("Arial", 10))
        self.details_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
    
    def extract_recipe(self):
        """Extract recipe from the provided URL using recipe-scrapers"""
        url = self.url_entry.get().strip()
        
        if not url:
            self.status_label.config(text="Please enter a URL", foreground="red")
            return
            
        if not (url.startswith('http://') or url.startswith('https://')):
            url = 'https://' + url
            
        self.status_label.config(text="Extracting recipe...", foreground="blue")
        self.root.update()
        
        try:
            # Use recipe-scrapers to extract recipe data
            print(f"Attempting to scrape recipe from: {url}")
            
            # First try with standard approach
            try:
                scraper = scrape_me(url)
            except Exception as e:
                print(f"Standard scraping failed: {str(e)}")
                # Try with wild_mode if it's available in this version
                try:
                    scraper = scrape_me(url, wild_mode=True)
                    print("Using wild_mode for scraping")
                except TypeError:
                    # If wild_mode parameter isn't available, re-raise the original error
                    raise e
            
            # Initialize recipe_data with safe defaults
            recipe_data = {
                'title': 'Untitled Recipe',
                'ingredients': [],
                'instructions': [],
                'yields': 'Not specified',
                'image': '',
                'host': '',
                'total_time': 'Not specified',
                'prep_time': 'Not specified',
                'cook_time': 'Not specified',
                'author': 'Not specified',
                'description': 'No description available.',
                'cuisine': 'Not specified',
                'category': 'Not specified',
                'nutrients': {}
            }
            
            # Safe method to get attributes
            def safe_get(method_name, default_value=None):
                try:
                    method = getattr(scraper, method_name)
                    return method()
                except (AttributeError, Exception) as e:
                    print(f"Could not get {method_name}: {str(e)}")
                    return default_value
            
            # Fill in data using safe_get
            recipe_data.update({
                'title': safe_get('title', 'Untitled Recipe'),
                'ingredients': safe_get('ingredients', []),
                'instructions': self.format_instructions(safe_get('instructions', '')),
                'yields': safe_get('yields', 'Not specified'),
                'image': safe_get('image', ''),
                'host': safe_get('host', url),
                'total_time': safe_get('total_time', 'Not specified'),
                'prep_time': safe_get('prep_time', 'Not specified'),
                'cook_time': safe_get('cook_time', 'Not specified'),
                'author': safe_get('author', 'Not specified'),
                'description': safe_get('description', 'No description available.'),
                'cuisine': safe_get('cuisine', 'Not specified'),
                'category': safe_get('category', 'Not specified'),
                'nutrients': safe_get('nutrients', {})
            })
            
            # Display the extracted recipe
            self.display_recipe(recipe_data)
            
            # Show success message
            host = recipe_data.get('host', '')
            if host:
                self.status_label.config(text=f"Recipe extracted successfully from {host}!", foreground="green")
            else:
                self.status_label.config(text=f"Recipe extracted successfully!", foreground="green")
                
            # Show info about supported sites if this is the first successful extraction
            if not hasattr(self, '_showed_success_info'):
                messagebox.showinfo(
                    "Recipe Extraction Successful", 
                    "Recipe successfully extracted!\n\n"
                    "Recipe Refiner works best with sites supported by the recipe-scrapers library. "
                    "Check the About tab for more information."
                )
                self._showed_success_info = True
            
        except Exception as e:
            error_message = f"Error: {str(e)}"
            self.status_label.config(text=error_message, foreground="red")
            
            # Display detailed error info in a messagebox
            detailed_error = traceback.format_exc()
            messagebox.showerror("Error Extracting Recipe", 
                                f"{error_message}\n\nDetails:\n{detailed_error}")
            
            # Also print to console for debugging
            print("Error extracting recipe:", file=sys.stderr)
            traceback.print_exc()
    
    def format_instructions(self, instructions):
        """Format instructions into a list of numbered steps"""
        if not instructions:
            return []
            
        # Check if instructions are already a list
        if isinstance(instructions, list):
            # Format each instruction with a number
            return [f"{i+1}. {step}" for i, step in enumerate(instructions)]
            
        # If instructions are a string, split by newlines and format
        steps = [step.strip() for step in instructions.split('\n') if step.strip()]
        return [f"{i+1}. {step}" for i, step in enumerate(steps)]
    
    def format_time(self, minutes):
        """Format time in minutes to human-readable format"""
        if not minutes or minutes == 0:
            return "Not specified"
            
        hours = minutes // 60
        mins = minutes % 60
        
        if hours > 0 and mins > 0:
            return f"{hours} hr {mins} min"
        elif hours > 0:
            return f"{hours} hr"
        else:
            return f"{mins} min"
    
    def display_recipe(self, recipe_data):
        """Display the extracted recipe in the UI"""
        # Store the current recipe data for clipboard functionality
        self.current_recipe_data = recipe_data
        
        # Clear previous content
        self.clear_content()
        
        # Set title and basic info
        self.title_var.set(recipe_data.get('title', 'Untitled Recipe'))
        self.description_text.insert(tk.END, recipe_data.get('description', 'No description available.'))
        
        # Set times
        # Convert time values to formatted strings if they are integers
        prep_time = recipe_data.get('prep_time')
        prep_time = self.format_time(prep_time) if isinstance(prep_time, int) else prep_time
        self.prep_time_var.set(prep_time)
        
        cook_time = recipe_data.get('cook_time')
        cook_time = self.format_time(cook_time) if isinstance(cook_time, int) else cook_time
        self.cook_time_var.set(cook_time)
        
        total_time = recipe_data.get('total_time')
        total_time = self.format_time(total_time) if isinstance(total_time, int) else total_time
        self.total_time_var.set(total_time)
        
        self.servings_var.set(recipe_data.get('yields', 'Not specified'))
        
        # Ingredients
        ingredients = recipe_data.get('ingredients', [])
        if ingredients:
            for item in ingredients:
                self.ingredients_text.insert(tk.END, f"• {item}\n")
        else:
            self.ingredients_text.insert(tk.END, "No ingredients found.")
        
        # Instructions
        instructions = recipe_data.get('instructions', [])
        if instructions:
            for step in instructions:
                self.instructions_text.insert(tk.END, f"{step}\n\n")
        else:
            self.instructions_text.insert(tk.END, "No instructions found.")
        
        # Details
        details = []
        
        if 'author' in recipe_data and recipe_data['author']:
            details.append(f"Author: {recipe_data['author']}")
            
        if 'host' in recipe_data and recipe_data['host']:
            details.append(f"Source: {recipe_data['host']}")
        
        if 'category' in recipe_data and recipe_data['category']:
            category = recipe_data['category']
            if isinstance(category, list):
                category = ', '.join(category)
            details.append(f"Category: {category}")
        
        if 'cuisine' in recipe_data and recipe_data['cuisine']:
            cuisine = recipe_data['cuisine']
            if isinstance(cuisine, list):
                cuisine = ', '.join(cuisine)
            details.append(f"Cuisine: {cuisine}")
        
        # Add nutrition information if available
        nutrients = recipe_data.get('nutrients', {})
        if nutrients:
            details.append("\nNutrition Information:")
            for nutrient, value in nutrients.items():
                details.append(f"• {nutrient.capitalize()}: {value}")
        
        if details:
            self.details_text.insert(tk.END, '\n\n'.join(details))
        else:
            self.details_text.insert(tk.END, "No additional details found.")
    
    def clear_content(self):
        """Clear all content fields"""
        self.description_text.delete(1.0, tk.END)
        self.ingredients_text.delete(1.0, tk.END)
        self.instructions_text.delete(1.0, tk.END)
        self.details_text.delete(1.0, tk.END)
    
    def clear_fields(self):
        """Clear all fields including URL input"""
        self.url_entry.delete(0, tk.END)
        self.clear_content()
        self.title_var.set("")
        self.prep_time_var.set("")
        self.cook_time_var.set("")
        self.total_time_var.set("")
        self.servings_var.set("")
        self.status_label.config(text="")
    
    def copy_to_clipboard(self):
        """Copy the recipe to clipboard in a formatted way"""
        if not hasattr(self, 'current_recipe_data') or not self.current_recipe_data:
            messagebox.showinfo("No Recipe", "Please extract a recipe first.")
            return
            
        recipe = self.current_recipe_data
        
        # Format the recipe as text
        text = []
        text.append(f"RECIPE: {recipe.get('title', 'Untitled Recipe')}")
        text.append("")
        
        if recipe.get('description'):
            text.append(recipe.get('description'))
            text.append("")
        
        # Time and servings info
        info_lines = []
        if recipe.get('prep_time') and recipe.get('prep_time') != 'Not specified':
            info_lines.append(f"Prep Time: {recipe.get('prep_time')}")
        if recipe.get('cook_time') and recipe.get('cook_time') != 'Not specified':
            info_lines.append(f"Cook Time: {recipe.get('cook_time')}")
        if recipe.get('total_time') and recipe.get('total_time') != 'Not specified':
            info_lines.append(f"Total Time: {recipe.get('total_time')}")
        if recipe.get('yields') and recipe.get('yields') != 'Not specified':
            info_lines.append(f"Servings: {recipe.get('yields')}")
        
        if info_lines:
            text.extend(info_lines)
            text.append("")
        
        # Ingredients
        text.append("INGREDIENTS:")
        for ingredient in recipe.get('ingredients', []):
            text.append(f"• {ingredient}")
        text.append("")
        
        # Instructions
        text.append("INSTRUCTIONS:")
        instructions = recipe.get('instructions', [])
        for instruction in instructions:
            text.append(instruction)
        
        # Convert to single string
        clipboard_text = "\n".join(text)
        
        # Copy to clipboard
        self.root.clipboard_clear()
        self.root.clipboard_append(clipboard_text)
        
        messagebox.showinfo("Success", "Recipe copied to clipboard!")
    
    def run(self):
        """Run the application"""
        self.root.mainloop()

if __name__ == "__main__":
    app = RecipeRefiner()
    app.run()