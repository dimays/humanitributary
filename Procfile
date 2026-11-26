release: python manage.py migrate --noinput
web: gunicorn config.wsgi:application --log-file -
worker: python manage.py run_jobs --loop
