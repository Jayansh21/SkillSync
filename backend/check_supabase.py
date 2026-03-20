try:
    from supabase.lib.client_options import ClientOptions
    print("Import successful")
    try:
        opts = ClientOptions(headers={"Authorization": "Bearer test"})
        print("ClientOptions(headers=...) successful")
        print(opts.headers)
    except Exception as e:
        print(f"ClientOptions(headers=...) failed: {e}")
        
    try:
        opts = ClientOptions()
        opts.headers = {"Authorization": "Bearer test"}
        print("Setting .headers attribute successful")
    except Exception as e:
        print(f"Setting .headers failed: {e}")

except ImportError:
    print("Import failed")
