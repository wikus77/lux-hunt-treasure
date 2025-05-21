const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const res = await fetch("https://vkjrqirvdvjbemsfzxof.functions.supabase.co/login-no-captcha", {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    console.log("📦 RISPOSTA login-no-captcha:", data);

    if (!res.ok) {
      throw new Error(data.error || "Login fallito");
    }

    const { access_token, refresh_token } = data;

    if (!access_token || !refresh_token) {
      throw new Error("Token mancante nella risposta");
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (sessionError) {
      throw new Error("Errore nella creazione della sessione: " + sessionError.message);
    }

    console.log("✅ Sessione creata");

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("email", email)
      .single();

    console.log("🧑 Profilo:", profileData);

    if (profileError || profileData?.role !== "admin") {
      await supabase.auth.signOut();
      throw new Error("Accesso riservato agli amministratori");
    }

    toast.success("Login riuscito");
    navigate("/test-admin-ui");

  } catch (err: any) {
    console.error("❌ Login Error:", err);
    toast.error("Errore durante il login", {
      description: err.message,
    });
  } finally {
    setIsLoading(false);
  }
};

