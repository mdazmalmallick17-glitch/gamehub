export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black/40 backdrop-blur-sm mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">Privacy Policy</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This platform is committed to protecting your privacy and ensuring a safe user experience. By creating an account or uploading content, you agree not to share harmful, illegal, copyrighted, or inappropriate material. Uploaded content must belong to you. We do not sell or share personal information with third parties. Any misuse, cheating, harassment, scams, or security violations will lead to account suspension or permanent ban. By continuing to use this website, you accept all terms, rules, and policies stated here.
          </p>
          <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
            <p className="text-xs text-muted-foreground">© 2025 HarysCode. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
