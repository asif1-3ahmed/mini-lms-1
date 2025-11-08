from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='category',
            field=models.CharField(
                max_length=50,
                choices=[
                    ('programming', 'Programming'),
                    ('design', 'Design'),
                    ('business', 'Business'),
                    ('other', 'Other')
                ],
                default='other'
            ),
        ),
    ]
