import customtkinter as ctk
from PIL import Image # Precisas disto para carregar a imagem

class FaceitApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("CS2 Dashboard - Colégio de São Miguel")
        self.geometry("1000x650")
        self.configure(fg_color="#15191C") # Fundo Escuro FACEIT

        # --- CARREGAR O LOGO ---
        # Substitui 'image_4c4522.png' pelo nome exato do ficheiro que guardaste
        logo_image = Image.open("LogocsmC2.png")
        self.logo_resizer = ctk.CTkImage(
            light_image=logo_image,
            dark_image=logo_image,
            size=(60, 60) # Ajusta o tamanho aqui
        )

        # --- SIDEBAR ---
        self.sidebar = ctk.CTkFrame(self, width=100, corner_radius=0, fg_color="#1E2328")
        self.sidebar.pack(side="left", fill="y")

        # Colocar o Logo no topo da Sidebar
        self.logo_label = ctk.CTkLabel(self.sidebar, image=self.logo_resizer, text="")
        self.logo_label.pack(pady=20, padx=10)

        # --- BOTÕES (Com a cor da Boina dos Comandos que pediste) ---
        self.btn_play = ctk.CTkButton(
            self.sidebar, 
            text="JOGAR", 
            fg_color="#9B001F", # Vermelho Comandos
            hover_color="#7A0018",
            width=80,
            height=35,
            font=("Arial", 12, "bold")
        )
        self.btn_play.pack(pady=10)

        # --- ÁREA CENTRAL (STATS) ---
        self.main_content = ctk.CTkFrame(self, fg_color="transparent")
        self.main_content.pack(side="right", fill="both", expand=True, padx=20, pady=20)

        # Título estilo FACEIT
        self.title_label = ctk.CTkLabel(
            self.main_content, 
            text="ESTATÍSTICAS CS2", 
            font=("Arial", 28, "bold"),
            text_color="white"
        )
        self.title_label.pack(anchor="w", pady=(0, 20))

        # Card de ELO
        self.elo_card = ctk.CTkFrame(self.main_content, fg_color="#1E2328", corner_radius=15)
        self.elo_card.pack(fill="x", ipady=20)
        
        self.elo_info = ctk.CTkLabel(
            self.elo_card, 
            text="Nível 10 - ELO 2850", 
            text_color="#FFCC00", # Amarelo do Colégio
            font=("Arial", 20, "bold")
        )
        self.elo_info.pack()

if __name__ == "__main__":
    app = FaceitApp()
    app.mainloop()